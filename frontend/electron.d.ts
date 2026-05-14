export {};

declare global {
  interface Window {
    secureVisionNative?: {
      getSystemStatus: () => Promise<{
        modelRuntime: string;
        pythonReady: boolean;
        onnxReady: boolean;
        tfliteReady: boolean;
        timestamp: number;
      }>;
      browser: {
        createTab: (payload: { tabId: string; url: string }) => Promise<{ tabId: string; title: string; url: string }>;
        activateTab: (payload: { tabId: string }) => Promise<{ ok: boolean }>;
        closeTab: (payload: { tabId: string }) => Promise<{ ok: boolean }>;
        navigateTab: (payload: { tabId: string; url: string }) => Promise<{ ok: boolean; url?: string; title?: string; secure?: boolean }>;
        setBounds: (payload: { x: number; y: number; width: number; height: number; visible: boolean }) => Promise<{ ok: boolean }>;
        goBack: (payload: { tabId: string }) => Promise<{ ok: boolean; url?: string; title?: string }>;
        goForward: (payload: { tabId: string }) => Promise<{ ok: boolean; url?: string; title?: string }>;
        reload: (payload: { tabId: string }) => Promise<{ ok: boolean }>;
        onTabUpdated: (callback: (payload: { tabId: string; title?: string; url?: string; secure?: boolean }) => void) => () => void;
      };
    };
  }
}
