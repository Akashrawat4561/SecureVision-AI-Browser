const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("secureVisionNative", {
  getSystemStatus: () => ipcRenderer.invoke("securevision:system"),
  browser: {
    createTab: (payload) => ipcRenderer.invoke("securevision:browser-create-tab", payload),
    activateTab: (payload) => ipcRenderer.invoke("securevision:browser-activate-tab", payload),
    closeTab: (payload) => ipcRenderer.invoke("securevision:browser-close-tab", payload),
    navigateTab: (payload) => ipcRenderer.invoke("securevision:browser-navigate-tab", payload),
    setBounds: (payload) => ipcRenderer.invoke("securevision:browser-set-bounds", payload),
    goBack: (payload) => ipcRenderer.invoke("securevision:browser-go-back", payload),
    goForward: (payload) => ipcRenderer.invoke("securevision:browser-go-forward", payload),
    reload: (payload) => ipcRenderer.invoke("securevision:browser-reload", payload),
    onTabUpdated: (callback) => {
      const listener = (_, payload) => callback(payload);
      ipcRenderer.on("securevision:tab-updated", listener);
      return () => ipcRenderer.removeListener("securevision:tab-updated", listener);
    },
  },
});
