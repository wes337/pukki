import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import Gift from "../gift";

export default function EditGift({ gift }) {
  return <Gift gift={gift} />;
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
    const { gid } = ctx.params;

    const {
      data: [gift],
    } = await supabase
      .from("gifts")
      .select("id, name, claimed_by ( user_id, name ), user, description, url")
      .eq("id", gid);

    return { props: { gift: gift || null } };
  },
});
