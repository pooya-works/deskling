const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desklingWindow", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  close: () => ipcRenderer.invoke("window:close"),
  getIdleSeconds: () => ipcRenderer.invoke("system:get-idle-seconds"),
});
