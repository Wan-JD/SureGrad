param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot "config.example.yaml")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-Config {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Config file not found: $Path"
    }

    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return $raw | ConvertFrom-Json
}

function Resolve-ConfigPathValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseDirectory,
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ([System.IO.Path]::IsPathRooted($Value)) {
        return [System.IO.Path]::GetFullPath($Value)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $BaseDirectory $Value))
}

function Resolve-ConfigFileTargets {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseDirectory,
        [object[]]$Files
    )

    if (-not $Files -or $Files.Count -eq 0) {
        return @()
    }

    $targets = @()
    foreach ($file in $Files) {
        if (-not $file) {
            continue
        }

        if ([System.IO.Path]::IsPathRooted([string]$file)) {
            $targets += [System.IO.Path]::GetFullPath([string]$file)
        } else {
            $targets += [System.IO.Path]::GetFullPath((Join-Path $BaseDirectory ([string]$file)))
        }
    }

    return $targets
}

function Invoke-PythonStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & python @Arguments
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "$Name failed with exit code ${exitCode}: python $($Arguments -join ' ')"
    }
}

$resolvedConfigPath = [System.IO.Path]::GetFullPath($ConfigPath)
$configDirectory = Split-Path -Parent $resolvedConfigPath
$config = Read-Config -Path $resolvedConfigPath

$inputDir = Resolve-ConfigPathValue -BaseDirectory $configDirectory -Value $config.input_dir
$normalizedDir = Resolve-ConfigPathValue -BaseDirectory $configDirectory -Value $config.normalized_dir

if ($config.PSObject.Properties.Name -contains "report_dir" -and $config.report_dir) {
    $reportDir = Resolve-ConfigPathValue -BaseDirectory $configDirectory -Value $config.report_dir
} else {
    $reportDir = Join-Path (Split-Path -Parent $normalizedDir) "reports"
}

if (-not (Test-Path -LiteralPath $inputDir)) {
    throw "Input directory not found: $inputDir"
}

New-Item -ItemType Directory -Force -Path $normalizedDir | Out-Null
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

$sourceValidateReportPath = Join-Path $reportDir "validate-source.json"
$normalizeReportPath = Join-Path $reportDir "normalize.json"
$normalizedValidateReportPath = Join-Path $reportDir "validate-normalized.json"
$importReportJsonPath = Join-Path $reportDir "import-report.json"
$importReportMarkdownPath = Join-Path $reportDir "import-report.md"
$finalReportPath = Join-Path $reportDir "dry-run-report.json"

$validateArgs = @(
    (Join-Path $PSScriptRoot "validate_csv.py")
)

if (-not $config.validation.strict_header_order) {
    $validateArgs += "--allow-header-reorder"
}

if ($config.validation.require_all_templates) {
    $validateArgs += "--require-all-templates"
}

$normalizeEnabled = [bool]$config.execution.normalize_before_validate
$totalSteps = if ($normalizeEnabled) { 4 } else { 2 }
$configuredFiles = if ($config.PSObject.Properties.Name -contains "files") { @($config.files) } else { @() }
$configuredInputTargets = Resolve-ConfigFileTargets -BaseDirectory $inputDir -Files $configuredFiles

if ($configuredInputTargets.Count -gt 0) {
    $validateArgs += $configuredInputTargets
} else {
    $validateArgs += $inputDir
}

$validateArgs += @("--report-file", $sourceValidateReportPath)

Write-Host "Step 1/${totalSteps}: validating source CSV files from $inputDir"
Invoke-PythonStep -Name "validate-source" -Arguments $validateArgs

if ($normalizeEnabled) {
    Write-Host "Step 2/${totalSteps}: normalizing CSV files into $normalizedDir"
    $normalizeArgs = @((Join-Path $PSScriptRoot "normalize_text.py"))

    if ($configuredInputTargets.Count -gt 0) {
        foreach ($target in $configuredInputTargets) {
            $normalizeArgs += @("--input", $target)
        }
    } else {
        $normalizeArgs += @("--input", $inputDir)
    }

    $normalizeArgs += @(
        "--output-dir",
        $normalizedDir,
        "--report-file",
        $normalizeReportPath
    )

    Invoke-PythonStep -Name "normalize" -Arguments $normalizeArgs

    $normalizedValidateArgs = @(
        (Join-Path $PSScriptRoot "validate_csv.py")
    )

    if ($configuredFiles.Count -gt 0) {
        foreach ($file in $configuredFiles) {
            $normalizedValidateArgs += (Join-Path $normalizedDir ([string]$file))
        }
    } else {
        $normalizedValidateArgs += $normalizedDir
    }

    if (-not $config.validation.strict_header_order) {
        $normalizedValidateArgs += "--allow-header-reorder"
    }

    if ($config.validation.require_all_templates) {
        $normalizedValidateArgs += "--require-all-templates"
    }

    $normalizedValidateArgs += @("--report-file", $normalizedValidateReportPath)

    Write-Host "Step 3/${totalSteps}: validating normalized CSV files"
    Invoke-PythonStep -Name "validate-normalized" -Arguments $normalizedValidateArgs
}

$generateReportArgs = @(
    (Join-Path $PSScriptRoot "generate_import_report.py"),
    "--input-dir",
    $inputDir,
    "--validate-source-report",
    $sourceValidateReportPath,
    "--output-json",
    $importReportJsonPath,
    "--output-markdown",
    $importReportMarkdownPath
)

if ($normalizeEnabled) {
    $generateReportArgs += @(
        "--normalize-report",
        $normalizeReportPath,
        "--validate-normalized-report",
        $normalizedValidateReportPath
    )
}

$reportStepNumber = if ($normalizeEnabled) { 4 } else { 2 }

Write-Host "Step ${reportStepNumber}/${totalSteps}: generating batch import report"
Invoke-PythonStep -Name "generate-import-report" -Arguments $generateReportArgs

$sourceValidateReport = Get-Content -LiteralPath $sourceValidateReportPath -Raw -Encoding UTF8 | ConvertFrom-Json
$normalizeReport = $null
$normalizedValidateReport = $null
$importReport = Get-Content -LiteralPath $importReportJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

if ($normalizeEnabled) {
    $normalizeReport = Get-Content -LiteralPath $normalizeReportPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $normalizedValidateReport = Get-Content -LiteralPath $normalizedValidateReportPath -Raw -Encoding UTF8 | ConvertFrom-Json
}

$finalReport = [ordered]@{
    tool = "run_import"
    ok = $true
    dry_run = [bool]$config.execution.dry_run
    config_path = $resolvedConfigPath
    input_dir = $inputDir
    normalized_dir = $normalizedDir
    report_dir = $reportDir
    steps = [ordered]@{
        validate_source = $sourceValidateReport
        normalize = $normalizeReport
        validate_normalized = $normalizedValidateReport
        generate_import_report = $importReport
    }
    summary = [ordered]@{
        source_files = [int]$sourceValidateReport.summary.files
        source_rows = [int]$sourceValidateReport.summary.rows
        source_errors = [int]$sourceValidateReport.summary.errors
        source_warnings = [int]$sourceValidateReport.summary.warnings
        normalized_files = if ($normalizeReport) { [int]$normalizeReport.summary.files } else { 0 }
        normalized_rows = if ($normalizeReport) { [int]$normalizeReport.summary.rows } else { 0 }
        changed_cells = if ($normalizeReport) { [int]$normalizeReport.summary.changed_cells } else { 0 }
        normalized_errors = if ($normalizedValidateReport) { [int]$normalizedValidateReport.summary.errors } else { 0 }
        normalized_warnings = if ($normalizedValidateReport) { [int]$normalizedValidateReport.summary.warnings } else { 0 }
        import_report_manual_review_items = [int]$importReport.quality_gate.manual_review_item_count
        import_report_blocking_issues = [int]$importReport.quality_gate.blocking_issue_count
        import_report_json = $importReportJsonPath
        import_report_markdown = $importReportMarkdownPath
    }
}

$finalReport | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $finalReportPath -Encoding UTF8

Write-Host "Dry-run summary: source_files=$($finalReport.summary.source_files) source_rows=$($finalReport.summary.source_rows) source_errors=$($finalReport.summary.source_errors) source_warnings=$($finalReport.summary.source_warnings) changed_cells=$($finalReport.summary.changed_cells) normalized_errors=$($finalReport.summary.normalized_errors) normalized_warnings=$($finalReport.summary.normalized_warnings)"
Write-Host "Dry-run report: $finalReportPath"

if ($config.execution.dry_run) {
    Write-Host "Dry-run complete. No database writes were executed."
} else {
    $importLogPath = Join-Path $reportDir "import-log.json"
    Write-Host "Step $($totalSteps + 1)/$($totalSteps + 1): importing validated CSV batch into PostgreSQL"
    $importArgs = @(
        (Join-Path $PSScriptRoot "import_to_db.py"),
        "--config",
        $resolvedConfigPath,
        "--report-dir",
        $reportDir
    )
    Invoke-PythonStep -Name "import-to-db" -Arguments $importArgs
    $importLog = Get-Content -LiteralPath $importLogPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $finalReport.summary.import_log_json = $importLogPath
    $finalReport.summary.imported_files = [int](@($importLog.files.PSObject.Properties).Count)
    $finalReport | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $finalReportPath -Encoding UTF8
    Write-Host "Database import complete. Log: $importLogPath"
}
