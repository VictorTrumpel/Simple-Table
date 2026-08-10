export type GetColumnDTO = {
  name: string;
  type: "text" | "numeric" | "enum" | "timestamp";
  id: string;
  enum: string[] | null;
};
