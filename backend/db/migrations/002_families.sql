CREATE TABLE pukki.families (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  code text NOT NULL UNIQUE CHECK (code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  created_by uuid NOT NULL REFERENCES pukki.users(user_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pukki.users ADD COLUMN family_id uuid REFERENCES pukki.families(id);
CREATE INDEX users_family_idx ON pukki.users (family_id);

CREATE TABLE pukki.family_join_attempts (
  user_id uuid PRIMARY KEY REFERENCES pukki.users(user_id) ON DELETE CASCADE,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
