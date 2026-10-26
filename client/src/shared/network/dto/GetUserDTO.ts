export type GetUserDTO = {
  token: string;

  userInfo: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    createdAt: string;
  };
};
