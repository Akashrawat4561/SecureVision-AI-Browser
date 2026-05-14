import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import BrowserPage from "./pages/BrowserPage";
import DashboardPage from "./pages/DashboardPage";
import DeepfakePage from "./pages/DeepfakePage";
import ListPage from "./pages/ListPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/browser" replace />} />
        <Route path="browser" element={<BrowserPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="deepfake" element={<DeepfakePage />} />
        <Route path="bookmarks" element={<ListPage title="Bookmarks" mode="bookmarks" />} />
        <Route path="history" element={<ListPage title="History" mode="history" />} />
        <Route path="downloads" element={<ListPage title="Downloads" mode="downloads" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
