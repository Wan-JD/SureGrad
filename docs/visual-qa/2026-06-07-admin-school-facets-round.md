# Admin School Facets QA - 2026-06-07

## Scope

- Added `GET /api/v1/admin/schools/facets` for full-database school filter options.
- Updated the admin `/schools` workspace to load province, city, level, type, and status filters from the facets endpoint instead of the first page of school records.
- Kept displayed counts tied to the imported MOE 2025 school dataset and existing curated overrides.

## Evidence

- Screenshot: `docs/.visual-qa/admin-schools-facets-desktop.png`
- Verified on the admin schools workspace:
  - Total school count: `2919`
  - Province facet example: `广东省 (166)`
  - Level facet example: `专科 (1554)`
  - Type facet example: `未分类 (2914)`

## Notes

- The browser check used an API login token written into `sessionStorage`, then opened `/schools`.
- The normal local login flow had intermittent Next.js dev-cache/RSC behavior during this round, but the API-backed page data and rendered admin workspace were verified from the running services.
