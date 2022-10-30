export async function getAllUsers() {
  try {
    const url = "/api/users";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getUser(uid) {
  try {
    const url = `/api/users/${uid}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user) {
  try {
    const url = `/api/users/${user.id}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function signOut() {
  try {
    const url = "/api/sign-out";
    const response = await fetch(url, { method: "POST" });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}
