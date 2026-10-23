import perspective, { type Client, type Table } from '@perspective-dev/client';
import perspectiveViewer from '@perspective-dev/viewer';
import '@perspective-dev/viewer-datagrid';
import '@perspective-dev/viewer-charts';
import '@perspective-dev/viewer/dist/css/themes.css';
import serverWasm from '@perspective-dev/server/dist/wasm/perspective-server.wasm?url';
import viewerWasm from '@perspective-dev/viewer/dist/wasm/perspective-viewer.wasm?url';

let initialization: Promise<void> | undefined;

const loadServer = async () => {
  const response = await fetch(serverWasm);
  if (!response.ok) throw new Error('Не удалось загрузить движок графика');

  // Fetch before creating a worker, so a failed download cannot orphan it.
  perspective.init_server(await response.arrayBuffer());
};

export const initializePerspective = () => {
  initialization ??= Promise.all([
    loadServer(),
    perspectiveViewer.init_client(fetch(viewerWasm)),
  ])
    .then(() => undefined)
    .catch((error: unknown) => {
      initialization = undefined;
      throw error;
    });

  return initialization;
};

export const disposeChartTable = async (client: Client, table?: Table) => {
  try {
    if (table) {
      let onDeleted!: () => void;
      const deleted = new Promise<void>((resolve) => {
        onDeleted = resolve;
      });

      // React deletes the viewer asynchronously. Keep its worker alive until
      // all views are released and the lazy table deletion actually finishes.
      await table.on_delete(onDeleted);
      await table.delete({ lazy: true });
      await deleted;
    }
  } finally {
    try {
      await client.terminate();
    } finally {
      client.free();
    }
  }
};
