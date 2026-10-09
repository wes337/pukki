-- Preserve existing invitations; new codes are generated with six characters.
ALTER TABLE pukki.families DROP CONSTRAINT families_code_check;
ALTER TABLE pukki.families ADD CONSTRAINT families_code_check
  CHECK (code ~ '^([A-HJ-NP-Z2-9]{6}|[A-HJ-NP-Z2-9]{8})$');
