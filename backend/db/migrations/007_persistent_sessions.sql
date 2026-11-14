-- Preserve active logins without bringing expired or revoked sessions back.
UPDATE pukki.sessions SET expires_at = 'infinity' WHERE expires_at > now();
ALTER TABLE pukki.sessions ALTER COLUMN expires_at SET DEFAULT 'infinity'::timestamptz;
