export type GetDbUserInfoDTO = {
  userId: 1;
  createdAt: string;
  role: 'admin' | 'writer' | 'reader';
  user: {
    createdAt: string;
    email: string;
    id: number;
  };
};
