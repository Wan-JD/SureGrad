ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE users
    ALTER COLUMN phone DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
    ON users (email)
    WHERE email IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_users_contact_present'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT chk_users_contact_present
            CHECK (phone IS NOT NULL OR email IS NOT NULL);
    END IF;
END $$;
