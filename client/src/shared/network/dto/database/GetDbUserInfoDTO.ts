export type GetDbUserInfoDTO = {
  id: 1;
  name: string;
  email: string;
  createdAt: string;
  role: "admin" | "writer" | "reader";
};
