import { createHash, randomBytes, randomUUID } from "node:crypto";
import { sql } from "#app/lib/sql.js";
import { hashPassword } from "#app/modules/passwords.js";

// Explicitly run this to add repeatable UI fixtures to pukki_test's current family.
// Existing users and gifts are never overwritten, and every query targets pukki.
const members = [
  ["alex", "Alex Johnson"],
  ["jamie", "Jamie Johnson"],
  ["morgan", "Morgan Johnson"],
  ["taylor", "Taylor Johnson"],
] as const;
type Member = typeof members[number][0] | "self";
const gifts: { owner: Member; name: string; description: string; claimant?: Member }[] = [
  { owner: "self", name: "Warm wool socks", description: "Size medium. Dark green or burgundy would be lovely." },
  { owner: "self", name: "A new sketchbook", description: "A5, with thick paper for pens and watercolours.", claimant: "alex" },
  { owner: "self", name: "Coffee beans", description: "A medium roast, whole beans." },
  { owner: "alex", name: "Board game for family nights", description: "Something cooperative for 4–6 players.", claimant: "self" },
  { owner: "alex", name: "Wool scarf", description: "Soft, warm, and preferably green.", claimant: "jamie" },
  { owner: "alex", name: "Stainless steel travel mug", description: "Leakproof and dishwasher safe, around 350 ml." },
  { owner: "alex", name: "A cookbook full of easy weekend baking recipes", description: "Bread, cinnamon rolls, and other things we can bake together.\nNo special equipment needed." },
  { owner: "jamie", name: "Watercolour paint set", description: "A small travel set with a brush.", claimant: "self" },
  { owner: "jamie", name: "Puzzle — 1,000 pieces", description: "A snowy village or winter landscape.", claimant: "self" },
  { owner: "jamie", name: "Reading light", description: "A rechargeable clip-on light for reading in bed." },
  { owner: "jamie", name: "Chocolate", description: "" },
  { owner: "morgan", name: "Knitted winter hat", description: "Adult size, navy blue.", claimant: "alex" },
  { owner: "morgan", name: "Gardening gloves", description: "Size large.", claimant: "jamie" },
  { owner: "morgan", name: "A book about the night sky", description: "Beginner friendly, with star maps.", claimant: "self" },
];

const client = await sql.connect();
try {
  await client.query("BEGIN");
  const { rows: [account] } = await client.query<{ user_id: string; family_id: string | null }>(
    "SELECT user_id, family_id FROM pukki.users WHERE username = $1 FOR UPDATE", ["pukki_test"],
  );
  if (!account?.family_id) throw new Error("pukki_test must already belong to a family");
  const ids: Record<string, string> = { self: account.user_id };
  // A discarded random password prevents these display-only fixtures from having a known login.
  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
  let addedMembers = 0;
  for (const [key, name] of members) {
    const username = `pukki_demo_${key}`;
    const result = await client.query(`INSERT INTO pukki.users (user_id, username, password_hash, name, family_id)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
    [randomUUID(), username, passwordHash, name, account.family_id]);
    addedMembers += result.rowCount ?? 0;
    const { rows: [member] } = await client.query<{ user_id: string; family_id: string }>(
      "SELECT user_id, family_id FROM pukki.users WHERE username = $1 FOR UPDATE", [username],
    );
    if (!member || member.family_id !== account.family_id) throw new Error("Demo username belongs to a different family; no changes saved");
    ids[key] = member.user_id;
  }
  let addedGifts = 0;
  for (const gift of gifts) {
    const hex = createHash("sha256").update(`pukki-preview:${account.family_id}:${gift.owner}:${gift.name}`).digest("hex");
    const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    const result = await client.query(`INSERT INTO pukki.gifts (id, "user", name, description, url, claimed_by)
      VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
    [id, ids[gift.owner], gift.name, gift.description, "", gift.claimant ? ids[gift.claimant] : null]);
    addedGifts += result.rowCount ?? 0;
  }
  await client.query("COMMIT");
  console.log(JSON.stringify({ addedMembers, addedGifts, target: "pukki_test family", schema: "pukki" }));
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await sql.end();
}
