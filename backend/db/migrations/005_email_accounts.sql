-- Keep legacy usernames for existing records and compatibility during rollout.
ALTER TABLE pukki.users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE pukki.users ADD COLUMN email text;
ALTER TABLE pukki.users ADD CONSTRAINT users_email_normalized
  CHECK (email IS NULL OR (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254));
ALTER TABLE pukki.users ADD CONSTRAINT users_email_key UNIQUE (email);
