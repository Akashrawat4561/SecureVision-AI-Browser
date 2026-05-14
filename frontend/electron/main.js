import { app, BrowserView, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
let mainWindow = null;
const tabViews = new Map();
let activeTabId = null;
let browserBounds = { x: 312, y: 160, width: 1220, height: 760, visible: true };

function sanitizeUrl(input) {
  if (!input) return "https://google.com";
  if (input.startsWith("securevision://home")) return "data:text/html;charset=utf-8,<html><body style='background-color:%23070b14;'></body></html>";
  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("data:")) return input;
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

function emitTabUpdate(tabId, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("securevision:tab-updated", { tabId, ...payload });
}

function applyBounds(view) {
  if (!view || !mainWindow) return;
  const { x, y, width, height } = browserBounds;
  view.setBounds({
    x: Math.max(0, Math.floor(x)),
    y: Math.max(0, Math.floor(y)),
    width: Math.max(100, Math.floor(width)),
    height: Math.max(120, Math.floor(height)),
  });
  view.setAutoResize({ width: true, height: true });
}

async function createTabView(tabId, initialUrl) {
  if (!mainWindow || tabViews.has(tabId)) return;
  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  view.webContents.on("page-title-updated", (event) => {
    event.preventDefault();
    emitTabUpdate(tabId, {
      title: view.webContents.getTitle(),
      url: view.webContents.getURL(),
    });
  });

  view.webContents.on("did-navigate", (_, url) => {
    emitTabUpdate(tabId, {
      title: view.webContents.getTitle(),
      url,
      secure: url.startsWith("https://"),
    });
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  tabViews.set(tabId, view);
  await view.webContents.loadURL(sanitizeUrl(initialUrl));
}

function activateTabView(tabId) {
  if (!mainWindow) return;
  const view = tabViews.get(tabId);
  if (!view) return;
  activeTabId = tabId;
  if (browserBounds.visible) {
    mainWindow.setBrowserView(view);
    applyBounds(view);
  }
}

function closeTabView(tabId) {
  const view = tabViews.get(tabId);
  if (!view) return;
  if (mainWindow && activeTabId === tabId) {
    mainWindow.setBrowserView(null);
  }
  view.webContents.destroy();
  tabViews.delete(tabId);
  if (activeTabId === tabId) activeTabId = null;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    title: "SecureVision Browser",
    backgroundColor: "#070b14",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    tabViews.forEach((view) => {
      if (!view.webContents.isDestroyed()) view.webContents.destroy();
    });
    tabViews.clear();
    mainWindow = null;
    activeTabId = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("securevision:system", async () => ({
  modelRuntime: "local-edge",
  pythonReady: true,
  onnxReady: true,
  tfliteReady: true,
  timestamp: Date.now(),
}));

ipcMain.handle("securevision:browser-create-tab", async (_, { tabId, url }) => {
  await createTabView(tabId, url);
  activateTabView(tabId);
  const view = tabViews.get(tabId);
  return {
    tabId,
    title: view?.webContents.getTitle() || "New Tab",
    url: view?.webContents.getURL() || sanitizeUrl(url),
  };
});

ipcMain.handle("securevision:browser-activate-tab", async (_, { tabId }) => {
  activateTabView(tabId);
  return { ok: true };
});

ipcMain.handle("securevision:browser-close-tab", async (_, { tabId }) => {
  closeTabView(tabId);
  return { ok: true };
});

ipcMain.handle("securevision:browser-navigate-tab", async (_, { tabId, url }) => {
  const view = tabViews.get(tabId);
  if (!view) return { ok: false };
  const nextUrl = sanitizeUrl(url);
  await view.webContents.loadURL(nextUrl);
  return {
    ok: true,
    url: nextUrl,
    title: view.webContents.getTitle() || nextUrl,
    secure: nextUrl.startsWith("https://"),
  };
});

ipcMain.handle("securevision:browser-set-bounds", async (_, nextBounds) => {
  browserBounds = { ...browserBounds, ...nextBounds };
  if (!mainWindow) return { ok: false };
  if (!browserBounds.visible) {
    mainWindow.setBrowserView(null);
    return { ok: true };
  }
  const view = activeTabId ? tabViews.get(activeTabId) : null;
  if (!view) return { ok: true };
  mainWindow.setBrowserView(view);
  applyBounds(view);
  return { ok: true };
});

ipcMain.handle("securevision:browser-go-back", async (_, { tabId }) => {
  const view = tabViews.get(tabId);
  if (!view) return { ok: false };
  if (view.webContents.navigationHistory.canGoBack()) {
    view.webContents.navigationHistory.goBack();
  }
  return {
    ok: true,
    url: view.webContents.getURL(),
    title: view.webContents.getTitle() || "SecureVision",
  };
});

ipcMain.handle("securevision:browser-go-forward", async (_, { tabId }) => {
  const view = tabViews.get(tabId);
  if (!view) return { ok: false };
  if (view.webContents.navigationHistory.canGoForward()) {
    view.webContents.navigationHistory.goForward();
  }
  return {
    ok: true,
    url: view.webContents.getURL(),
    title: view.webContents.getTitle() || "SecureVision",
  };
});

ipcMain.handle("securevision:browser-reload", async (_, { tabId }) => {
  const view = tabViews.get(tabId);
  if (!view) return { ok: false };
  view.webContents.reload();
  return { ok: true };
});
