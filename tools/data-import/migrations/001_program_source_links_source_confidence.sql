-- Align legacy DBs with docs/schema.sql for program_source_links.
ALTER TABLE program_source_links
  ADD COLUMN IF NOT EXISTS source_confidence VARCHAR(20);

UPDATE program_source_links
SET source_confidence = 'official'
WHERE source_confidence IS NULL;

ALTER TABLE program_source_links
  ALTER COLUMN source_confidence SET NOT NULL;

ALTER TABLE program_source_links
  DROP CONSTRAINT IF EXISTS chk_program_source_links_source_confidence;

ALTER TABLE program_source_links
  ADD CONSTRAINT chk_program_source_links_source_confidence
  CHECK (source_confidence IN ('official', 'estimated', 'manual'));
