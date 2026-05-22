import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import psycopg

conn = psycopg.connect(
    "host=127.0.0.1 port=5432 dbname=suregrad user=postgres password=postgres"
)
cur = conn.cursor()
cur.execute(
    """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'program_source_links'
    ORDER BY ordinal_position
    """
)
print("program_source_links:", [r[0] for r in cur.fetchall()])
cur.execute("SELECT count(*) FROM schools WHERE deleted_at IS NULL")
print("schools:", cur.fetchone()[0])
cur.execute("SELECT name FROM schools WHERE deleted_at IS NULL LIMIT 5")
print("names:", [r[0] for r in cur.fetchall()])
conn.close()
