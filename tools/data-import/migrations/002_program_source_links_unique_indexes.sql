CREATE UNIQUE INDEX IF NOT EXISTS uq_program_source_links_program_year_url
    ON program_source_links (program_id, exam_year, url)
    WHERE exam_year IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_program_source_links_program_url_when_year_null
    ON program_source_links (program_id, url)
    WHERE exam_year IS NULL;
