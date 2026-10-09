export interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  avatar_url: string | null;
  family_id: string | null;
  family_name: string | null;
}

export interface Family {
  id: string;
  name: string;
  code: string;
}

export interface Gift {
  id: string;
  name: string;
  user: string;
  description: string;
  url: string;
  claimed_by: UserProfile | null;
  users: UserProfile;
}
