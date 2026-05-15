import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import ThreatMap from './pages/ThreatMap'
import Phishing from './pages/Phishing'
import Anomaly from './pages/Anomaly'
import Deepfake from './pages/Deepfake'
import EdgeStatus from './pages/EdgeStatus'
import ResponseCenter from './pages/ResponseCenter'
import Architecture from './pages/Architecture'
import Settings from './pages/Settings'
import Honeypot from './pages/Honeypot'
import About from './pages/About'


import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
    return (
        <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="threatmap" element={<ThreatMap />} />
                    <Route path="phishing" element={<Phishing />} />
                    <Route path="anomaly" element={<Anomaly />} />
                    <Route path="deepfake" element={<Deepfake />} />
                    <Route path="honeypot" element={<Honeypot />} />
                    <Route path="edge" element={<EdgeStatus />} />
                    <Route path="response" element={<ResponseCenter />} />
                    <Route path="architecture" element={<Architecture />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="about" element={<About />} />

                </Route>
            </Route>
        </Routes>
    )
}

export default App
