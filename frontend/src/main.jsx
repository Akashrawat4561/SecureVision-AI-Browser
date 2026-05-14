import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BrowserProvider } from "./browser/BrowserContext";
import { SecurityProvider } from "./security/SecurityContext";
import { DeepfakeProvider } from "./deepfake/DeepfakeContext";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SecurityProvider>
        <DeepfakeProvider>
          <BrowserProvider>
            <App />
          </BrowserProvider>
        </DeepfakeProvider>
      </SecurityProvider>
    </BrowserRouter>
  </StrictMode>,
);
