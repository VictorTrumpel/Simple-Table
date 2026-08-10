export const getTableIdFromPageUrl = (path: string) => {
  if (!path.startsWith("/table-item")) return null;

  const pathSections = path.split("/");

  const tableId = pathSections.find((p) => p.startsWith("t_"));

  if (!tableId) return null;

  return tableId;
};
