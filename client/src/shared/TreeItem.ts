import { styled } from "@mui/material/styles";
import {
  TreeItem as BaseTreeItem,
  treeItemClasses,
} from "@mui/x-tree-view/TreeItem";

export const TreeItem = styled(BaseTreeItem)(() => ({
  [`& .${treeItemClasses.content}`]: {
    gap: "2px",
  },
  [`& .${treeItemClasses.label}`]: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    justifyContent: "space-between",
  },
  [`& .${treeItemClasses.label} .tree-label-title`]: {
    marginLeft: 0,
    marginRight: "auto",
  },
}));
