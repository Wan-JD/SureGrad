# Admin Data Coverage QA - 2026-06-07

## Scope

- Added `GET /api/v1/admin/data-coverage`.
- Added the admin home "数据库覆盖缺口" dashboard.
- Imported the `official-school-websites-2026-06-07` official website batch into the local database for runtime verification.

## Evidence

- Screenshot: `docs/.visual-qa/admin-data-coverage-dashboard-desktop.png`
- Verified from the rendered admin home dashboard:
  - School total: `2919`
  - Missing official websites: `2906`
  - Missing graduate websites: `2906`
  - Schools without programs: `2914`
  - Official source links: `13`

## API Runtime Check

`GET /api/v1/admin/data-coverage` returned:

- `schools.total=2919`
- `schools.withOfficialWebsite=13`
- `schools.withGraduateWebsite=13`
- `programs.total=6`
- `programs.withoutScoreLines=3`
- `programs.withoutApplicationStats=6`
- `yearlyRecords.examSubjects=20`

The first implementation accidentally counted joined school rows and returned `2920`; the query was corrected to use `COUNT(DISTINCT school.id)` before this QA record was written.
