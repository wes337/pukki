import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import {
  Button,
  Divider,
  IconArrowLeft,
  IconGift,
  IconTrash,
  Typography,
} from "@supabase/ui";

export default function User() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gifts, setGifts] = useState([]);
  const [isMe, setIsMe] = useState(false);

  const { uid } = router.query;

  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      setLoading(true);
      setIsMe(uid === session.user.id);

      Promise.all([getUser(), getGifts()]).then(() => {
        setLoading(false);
      });
      getGifts();
    }
  }, [session]);

  async function getUser() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", uid);

      if (error) {
        throw error;
      }

      setUser(data[0]);
    } catch (error) {
      console.log(error);
    }
  }

  async function getGifts() {
    try {
      let { data, error } = await supabase
        .from("gifts")
        .select("*")
        .eq("user", uid);

      if (error) {
        throw error;
      }

      setGifts(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function removeGift(giftId) {
    try {
      const { error } = await supabase.from("gifts").delete().eq("id", giftId);

      if (error) {
        throw error;
      }

      setGifts((gifts) => gifts.filter(({ id }) => id !== giftId));
    } catch (error) {
      console.log(error);
    }
  }

  async function addGift() {
    try {
      const gift = {
        name: "Test gift",
        url: "http://google.com",
        user: "f126e7fb-79a9-4377-ade3-be654317f4af",
      };

      const { data, error } = await supabase
        .from("gifts")
        .insert(gift)
        .select();

      if (error) {
        throw error;
      }

      setGifts((gifts) => [...gifts, data[0]]);
    } catch (error) {
      console.log(error);
    }
  }

  const renderClaimButton = (gift) => {
    if (isMe) {
      return null;
    }

    if (gift.claimed_by) {
      return <span>Claimed by {gift.claimed_by}</span>;
    }

    return <Button>Claim!</Button>;
  };

  const renderViewButton = (gift) => {
    if (!gift.url) {
      return;
    }

    return (
      <Button
        type="link"
        onClick={() => {
          window.open(gift.url, "_blank");
        }}
      >
        View
      </Button>
    );
  };

  if (loading || !user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button icon={<IconArrowLeft />} onClick={() => router.push("/users")}>
          Back
        </Button>
        <Typography.Title level={4} style={{ margin: "auto" }}>
          {isMe ? "Your" : `${user.name}'s`} gifts
        </Typography.Title>
        <img
          src={user.avatar_url}
          height={30}
          width={30}
          alt=""
          style={{ borderRadius: "100%", outline: "1px solid lightgray" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {gifts.map((gift, i) => (
          <Fragment key={gift.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Typography.Text type="secondary">{i + 1} - </Typography.Text>
                <Typography.Text strong>{gift.name}</Typography.Text>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {renderViewButton(gift)} {renderClaimButton(gift)}
                {isMe && (
                  <Button
                    type="outline"
                    icon={<IconTrash />}
                    danger
                    onClick={() => removeGift(gift.id)}
                  ></Button>
                )}
              </div>
            </div>
            {i < gifts.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
      <Button
        block
        icon={<IconGift size={28} />}
        style={{ fontSize: 16 }}
        onClick={addGift}
      >
        Add Gift
      </Button>
    </>
  );
}
