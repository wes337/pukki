export async function getGiftsForUser(uid) {
  try {
    const url = `/api/users/${uid}/gifts`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getAllGifts() {
  try {
    const url = "/api/gifts";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getGiftsClaimedByUser(uid) {
  try {
    const url = `/api/users/${uid}/claimed`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getGift(gid) {
  try {
    const url = `/api/gifts/${gid}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function removeGift(gid) {
  try {
    const url = `/api/gifts/${gid}`;
    await fetch(url, { method: "DELETE" });
  } catch (error) {
    console.log(error);
  }
}

export async function addGift(gift) {
  try {
    const url = "/api/gifts";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gift),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function claimGift(gid, claimedBy) {
  try {
    const url = `/api/gifts/${gid}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(claimedBy),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}
