import { sql } from "#app/lib/sql.js";

// Only assign generated avatars to the named test accounts in pukki_test's family.
const avatars = [
  ["pukki_test", "auburn-elf"],
  ["pukki_demo_alex", "winter-stubble"],
  ["pukki_demo_jamie", "santa-curls"],
  ["pukki_demo_morgan", "polar-bear"],
  ["pukki_demo_taylor", "penguin"],
] as const;
const client = await sql.connect();
try {
  await client.query("BEGIN");
  const { rows: [account] } = await client.query<{ family_id: string | null }>(
    "SELECT family_id FROM pukki.users WHERE username = $1 FOR UPDATE", ["pukki_test"],
  );
  if (!account?.family_id) throw new Error("pukki_test must belong to a family");
  for (const [username, avatar] of avatars) {
    const result = await client.query(`UPDATE pukki.users SET avatar_url = $1
      WHERE username = $2 AND family_id = $3`, [`/images/avatars/${avatar}.png`, username, account.family_id]);
    if (result.rowCount !== 1) throw new Error(`Expected test member ${username} in the target family`);
  }
  await client.query("COMMIT");
  console.log(`Updated ${avatars.length} test avatars in the pukki schema.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await sql.end();
}
