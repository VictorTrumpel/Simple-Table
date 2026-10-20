import { useState } from 'react';
import { useLifecycles } from 'react-use';
import { SimpleTreeView } from '@mui/x-tree-view';
import { DBTreeItem } from '@entity';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessAddDb } from '../AddDBAction/index.js';
import { SuccessAddTable } from './TableTreeItems/index.js';
import { TableTreeItems } from './TableTreeItems/index.js';
import { GraphTreeItem, SuccessAddGraph } from './GraphTreeItem/index.js';
import { useHistory } from 'react-router-dom';
import type { GetTreeDatabaseDTO } from '@shared/network';
import { SuccessDeleteTable } from './TableTreeItem/events/SuccessDeleteTable.js';

export const DatabaseTreeView = () => {
  const { getTree, handleAddDatabase } = useViewModel();

  const history = useHistory();

  const [tree, setTree] = useState<GetTreeDatabaseDTO[] | null>(null);

  const handleUpdateTree = async () => {
    const response = await getTree();
    setTree(response.data);
  };

  const handleSelectItem = (entityUrl: string | null) => {
    if (!entityUrl) return;

    const isTableEntity = entityUrl.startsWith('/table-item');
    const isChartEntity = entityUrl.startsWith('/chart-item/');
    const isPaticipantEntity = entityUrl.startsWith('/paticipant-list');

    if (isTableEntity || isChartEntity || isPaticipantEntity) {
      history.push(entityUrl);
      return;
    }
  };

  useLifecycles(
    () => {
      handleUpdateTree();

      window.addEventListener(SuccessAddDb, handleUpdateTree);
      window.addEventListener(SuccessAddTable, handleUpdateTree);
      window.addEventListener(SuccessAddGraph, handleUpdateTree);
      window.addEventListener(SuccessDeleteTable, handleUpdateTree);
    },
    () => {
      window.removeEventListener(SuccessAddDb, handleUpdateTree);
      window.removeEventListener(SuccessAddTable, handleUpdateTree);
      window.removeEventListener(SuccessAddGraph, handleUpdateTree);
      window.removeEventListener(SuccessDeleteTable, handleUpdateTree);
    },
  );

  return (
    <SimpleTreeView
      sx={{ flex: 1, overflow: 'auto' }}
      onSelectedItemsChange={(_, itemId) => {
        handleSelectItem(itemId);
      }}
    >
      {tree?.map((db) => (
        <DBTreeItem
          key={`/database/${db.id}`}
          itemId={`/database/${db.id}`}
          iconKey="database"
          label={db.name}
          onAddEntity={handleAddDatabase}
          showOptions={false}
        >
          <TableTreeItems role={db.role} dbId={db.id} tables={db.tables} />

          <GraphTreeItem role={db.role} dbId={db.id} charts={db.charts ?? []} />

          <DBTreeItem
            itemId={`/paticipant-list/${db.id}`}
            iconKey="paticipant"
            label="Участники"
            showOptions={false}
          />
        </DBTreeItem>
      ))}
    </SimpleTreeView>
  );
};
