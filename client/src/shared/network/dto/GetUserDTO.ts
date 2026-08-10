export type GetUserDTO = {
  token: string;

  userInfo: {
    name: string;
    email: string;
    createdAt: string;
  };
};
