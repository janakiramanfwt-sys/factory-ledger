const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ledgerAPI', {
  getData:        ()     => ipcRenderer.invoke('ledger:getData'),
  saveData:       (json) => ipcRenderer.invoke('ledger:saveData', json),
  openExternal:   (url)  => ipcRenderer.invoke('ledger:openExternal', url),
  checkUpdates:   ()     => ipcRenderer.invoke('ledger:checkUpdates'),
  installUpdate:  ()     => ipcRenderer.invoke('ledger:installUpdate'),
  onUpdateStatus: (cb)   => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('ledger:updateStatus', handler);
    return () => ipcRenderer.removeListener('ledger:updateStatus', handler);
  },
});
