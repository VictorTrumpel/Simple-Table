import { type MouseEvent } from "react";
import { TreeItem, mainVioletColor } from "@shared";
import { FaDatabase, FaTable } from "react-icons/fa6";
import { TbSql } from "react-icons/tb";
import { IoLinkSharp, IoChatbox } from "react-icons/io5";
import { TbUsers } from "react-icons/tb";
import type { TreeItemProps } from "@mui/x-tree-view";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const iconMatcher = {
  database: <FaDatabase color={mainVioletColor} />,
  table: <FaTable color={mainVioletColor} />,
  query: <TbSql transform="scale(1.2)" color={mainVioletColor} />,
  link: <IoLinkSharp color={mainVioletColor} />,
  paticipant: <TbUsers color={mainVioletColor} />,
  chat: <IoChatbox color={mainVioletColor} />,
};

type DBTreeItemProps = TreeItemProps & {
  iconKey: keyof typeof iconMatcher;
  showOptions?: boolean;
  onAddEntity?: (addEventName: `${keyof typeof iconMatcher}_add`) => void;
  onDeleteEntity?: (
    deleteEventName: `${keyof typeof iconMatcher}_delete`
  ) => void;
};

export const DBTreeItem = ({
  label,
  children,
  iconKey,
  showOptions = true,
  onAddEntity,
  ...props
}: DBTreeItemProps) => {
  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    onAddEntity?.(`${iconKey}_add`);
  };

  return (
    <TreeItem
      {...props}
      onClick={(e) => e.stopPropagation()}
      label={
        <>
          {iconMatcher[iconKey]}

          <span className="MuiTreeItem-iconContainer tree-label-title">
            {label}
          </span>

          {showOptions && (
            <IconButton
              datatype="not-expand-tree"
              className="item-option-btn"
              size="small"
              onClick={handleAdd}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          )}
        </>
      }
    >
      {children}
    </TreeItem>
  );
};
