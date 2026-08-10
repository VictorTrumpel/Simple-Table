import { tableService } from "@shared/network";
import { databaseService } from "@shared/network";
import { tableMenuActions, type TableMenuPanel } from "@shared/model";
import { historyMenuActions } from "@shared/model";
import { useAppSelector } from "@shared/model";
import { useAppDispatch } from "@shared/model";

export const useViewModel = () => {
  const dispath = useAppDispatch();

  const activePanel = useAppSelector((state) => state.tableMenu.activePanel);

  const isActiveMenuHistory = useAppSelector(
    (state) => state.historyMenu.isActive
  );

  const getTableInfo = async (tableId: string) => {
    return await tableService.getTableMeta(tableId);
  };

  const setTableMenuActivePanel = (panel: TableMenuPanel) => {
    dispath(tableMenuActions.setActivePanel(panel));
  };

  const checkRole = async (dbId: string) => {
    return await databaseService.getRole(dbId);
  };

  const handleTogleMenuHistory = () => {
    if (isActiveMenuHistory) {
      dispath(historyMenuActions.setActive(false));
      return;
    }

    dispath(historyMenuActions.setActive(true));
  };

  const handleDownload = async (tableId?: string) => {
    if (!tableId) return;

    const response = await tableService.getExport(String(tableId));

    if (response.data) {
      const blob = response.data;

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${new Date().toISOString()}.xlsx`;
      link.click();
    }
  };

  return {
    isActiveMenuHistory,
    activePanel,
    getTableInfo,
    checkRole,
    setTableMenuActivePanel,
    handleTogleMenuHistory,
    handleDownload,
  };
};
