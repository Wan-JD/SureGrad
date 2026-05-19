import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { AdminDataset, AdminFilter, AdminRecord } from "@/lib/admin-operations";

type CsvRow = Record<string, string>;

export type CollectedBatchSummary = {
  id: string;
  title: string;
  readmePath: string;
  collectedAt: string | null;
  csvFiles: string[];
  schoolNames: string[];
  years: number[];
  counts: {
    schools: number;
    departments: number;
    programs: number;
    scoreLines: number;
    sourceLinks: number;
  };
  missingTemplates: string[];
};

const collectedRoot = path.resolve(process.cwd(), "..", "..", "tools", "data-import", "collected");

const trackedTemplates = [
  "schools.csv",
  "departments.csv",
  "programs.csv",
  "program_admissions.csv",
  "program_score_lines.csv",
  "program_application_stats.csv",
  "program_interview_stats.csv",
  "program_exam_subjects.csv",
  "program_reference_books.csv",
  "program_source_links.csv",
] as const;

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce<CsvRow>((record, header, index) => {
      record[header] = values[index]?.trim() ?? "";
      return record;
    }, {});
  });
}

async function readCsvFile(batchPath: string, fileName: string): Promise<CsvRow[]> {
  try {
    const content = await fs.readFile(path.join(batchPath, fileName), "utf8");
    return parseCsv(content);
  } catch {
    return [];
  }
}

async function readBatchReadme(batchPath: string): Promise<string> {
  try {
    return await fs.readFile(path.join(batchPath, "README.md"), "utf8");
  } catch {
    return "";
  }
}

function extractCollectedAt(readme: string): string | null {
  const match = readme.match(/采集日期：`([^`]+)`/);
  return match?.[1] ?? null;
}

function toNumberSet(values: Array<string | number | undefined>): number[] {
  return [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))].sort(
    (left, right) => right - left,
  );
}

function toStringSet(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function formatBatchTitle(schoolNames: string[], years: number[], fallback: string): string {
  if (schoolNames.length === 0 && years.length === 0) {
    return fallback;
  }

  if (schoolNames.length === 0) {
    return `${years.join("/")} 年采集批次`;
  }

  if (years.length === 0) {
    return `${schoolNames.join(" / ")} 采集批次`;
  }

  return `${schoolNames.join(" / ")} ${years.join("/")} 批次`;
}

async function readBatchSummary(batchDirectoryName: string): Promise<CollectedBatchSummary> {
  const batchPath = path.join(collectedRoot, batchDirectoryName);
  const entries = await fs.readdir(batchPath, { withFileTypes: true });
  const csvFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
    .map((entry) => entry.name)
    .sort();

  const [readme, schools, departments, programs, scoreLines, sourceLinks] = await Promise.all([
    readBatchReadme(batchPath),
    readCsvFile(batchPath, "schools.csv"),
    readCsvFile(batchPath, "departments.csv"),
    readCsvFile(batchPath, "programs.csv"),
    readCsvFile(batchPath, "program_score_lines.csv"),
    readCsvFile(batchPath, "program_source_links.csv"),
  ]);

  const schoolNames = toStringSet([
    ...schools.map((row) => row.name),
    ...departments.map((row) => row.school_name),
    ...programs.map((row) => row.school_name),
  ]);
  const years = toNumberSet([
    ...scoreLines.map((row) => row.exam_year),
    ...sourceLinks.map((row) => row.exam_year),
  ]);

  return {
    id: batchDirectoryName,
    title: formatBatchTitle(schoolNames, years, batchDirectoryName),
    readmePath: path.join(collectedRoot, batchDirectoryName, "README.md"),
    collectedAt: extractCollectedAt(readme),
    csvFiles,
    schoolNames,
    years,
    counts: {
      schools: schools.length,
      departments: departments.length,
      programs: programs.length,
      scoreLines: scoreLines.length,
      sourceLinks: sourceLinks.length,
    },
    missingTemplates: trackedTemplates.filter((template) => !csvFiles.includes(template)),
  };
}

export async function getCollectedImportBatches(): Promise<CollectedBatchSummary[]> {
  try {
    const entries = await fs.readdir(collectedRoot, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    const summaries = await Promise.all(directories.map((directory) => readBatchSummary(directory)));

    return summaries.sort((left, right) => {
      const leftDate = left.collectedAt ?? "";
      const rightDate = right.collectedAt ?? "";
      return rightDate.localeCompare(leftDate) || left.id.localeCompare(right.id);
    });
  } catch {
    return [];
  }
}

export async function getCollectedSourceLinkRecords(): Promise<AdminRecord[]> {
  const batches = await getCollectedImportBatches();
  const records = await Promise.all(
    batches.map(async (batch) => {
      const rows = await readCsvFile(path.join(collectedRoot, batch.id), "program_source_links.csv");
      return rows.map<AdminRecord>((row, index) => ({
        id: `${batch.id}:source:${index + 1}`,
        program_id: `${row.school_name} / ${row.department_name} / ${row.program_name} (${row.program_code})`,
        exam_year: Number(row.exam_year),
        source_type: row.source_type,
        title: row.title,
        url: row.url,
        publisher_name: row.publisher_name,
        published_at: row.published_at || null,
        last_verified_at: row.last_verified_at,
        status: row.status,
        source_confidence: row.source_confidence,
        notes: row.notes || `采集批次: ${batch.id}`,
        created_at: row.last_verified_at,
        updated_at: row.last_verified_at,
      }));
    }),
  );

  return records.flat().sort((left, right) => String(right.last_verified_at).localeCompare(String(left.last_verified_at)));
}

export async function getCollectedYearlyDatasetRecords(): Promise<Record<string, AdminRecord[]>> {
  const batches = await getCollectedImportBatches();
  const scoreLineGroups = await Promise.all(
    batches.map(async (batch) => {
      const rows = await readCsvFile(path.join(collectedRoot, batch.id), "program_score_lines.csv");
      return rows.map<AdminRecord>((row, index) => ({
        id: `${batch.id}:score-line:${index + 1}`,
        program_id: `${row.school_name} / ${row.department_name} / ${row.program_name} (${row.program_code})`,
        exam_year: Number(row.exam_year),
        score_line_type: row.score_line_type,
        total_score: Number(row.total_score),
        politics_score: Number(row.politics_score),
        english_score: Number(row.english_score),
        subject_one_score: Number(row.subject_one_score),
        subject_two_score: Number(row.subject_two_score),
        notes: row.notes || `采集批次: ${batch.id}`,
        source_confidence: row.source_confidence,
        created_at: batch.collectedAt ?? null,
        updated_at: batch.collectedAt ?? null,
      }));
    }),
  );

  return {
    "program_admissions": [],
    "program_score_lines": scoreLineGroups.flat().sort((left, right) => Number(right.exam_year) - Number(left.exam_year)),
    "program_application_stats": [],
    "program_interview_stats": [],
  };
}

export function buildDynamicFilters(
  dataset: AdminDataset,
  records: AdminRecord[],
  keys: string[],
): AdminFilter[] {
  const filterSet = new Set(keys);

  return dataset.filters.map((filter) => {
    if (!filterSet.has(filter.key)) {
      return filter;
    }

    const values = [...new Set(records.map((record) => record[filter.key]).filter((value) => value !== undefined && value !== null))]
      .map((value) => String(value))
      .sort((left, right) => {
        if (/^\d+$/.test(left) && /^\d+$/.test(right)) {
          return Number(right) - Number(left);
        }

        return left.localeCompare(right);
      });

    return {
      ...filter,
      options: [
        filter.options[0] ?? { label: "全部", value: "" },
        ...values.map((value) => ({
          label: value,
          value,
        })),
      ],
    };
  });
}
