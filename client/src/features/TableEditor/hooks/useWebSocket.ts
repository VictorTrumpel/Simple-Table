import { useLifecycles } from "react-use";
import { useRef } from "react";
import { SOCKET_CONNECTION_URL } from "@shared/network";
import { useGridApiRef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { useAppSelector } from "@shared/model";
import { SuccessAddRowEvent } from "@features";

export const useWebSocket = (tableId: string) => {
  const userEmail = useAppSelector((state) => state.userInfo.user?.email);

  const socketRef = useRef<WebSocket | null>(null);
  const { palette, alpha } = useTheme();

  const apiGridRef = useGridApiRef();

  const handleSetCellBusy = (
    colId: string,
    rowId: string,
    user: { email: string; id: number; name: string }
  ) => {
    const apiGrid = apiGridRef.current;

    if (!apiGrid) return;
    if (user.email === userEmail) return;

    const cellElement = apiGrid.getCellElement(rowId, colId);

    if (!cellElement) return;

    cellElement.style.backgroundColor = alpha(palette.primary.light, 0.3);
    cellElement.style.position = "relative";
    const email = document.createElement("code");
    email.classList.add("user-email");
    email.innerHTML = user.email;
    email.style.fontWeight = "bold";
    email.style.position = "absolute";
    email.style.top = "19px";
    email.style.left = "10px";

    cellElement.append(email);
  };

  const handleSetCellFree = (colId: string, rowId: string) => {
    const apiGrid = apiGridRef.current;

    if (!apiGrid) return;

    const cellElement = apiGrid.getCellElement(rowId, colId);

    if (!cellElement) return;

    cellElement.querySelector("code")?.remove();
    cellElement.style.backgroundColor = "inherit";
  };

  const handleSetCellValue = ({
    colId,
    rowId,
    value,
  }: {
    colId: string;
    rowId: string;
    value: string;
  }) => {
    const apiGrid = apiGridRef.current;
    if (!apiGrid) return;

    apiGrid.updateRows([{ id: rowId, [colId]: value }]);
  };

  const handleMessage = (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);

      const eventAction = data.eventAction;

      if (eventAction === "fetch_table") {
        window.dispatchEvent(new Event(SuccessAddRowEvent));
      }

      if (eventAction === "set_cell_free") {
        const colId = data.payload.column_id as string;
        const rowId = data.payload.row_id as string;
        handleSetCellFree(colId, rowId);
      }

      if (eventAction === "set_cell_busy") {
        const colId = data.payload.column_id as string;
        const rowId = data.payload.row_id as string;
        const user = data.payload.user as {
          email: string;
          id: number;
          name: string;
        };

        handleSetCellBusy(colId, rowId, user);
      }

      if (eventAction === "set_cell_value") {
        const colId = data.payload.column_id as string;
        const rowId = data.payload.row_id as string;
        const value = data.payload.value as string;
        handleSetCellValue({ colId, rowId, value });
      }
    } catch (err) {
      console.log("err :>> ", err);
      return;
    }
  };

  const handleMount = () => {
    try {
      const ws = new WebSocket(
        `${SOCKET_CONNECTION_URL}/tables?topic=${tableId}`
      );

      ws.addEventListener("message", handleMessage);

      socketRef.current = ws;
    } catch (err) {
      console.error(err);
    }
  };

  useLifecycles(
    () => {
      handleMount();
    },
    () => {
      socketRef.current?.close();
    }
  );

  return apiGridRef;
};
