import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import PlayPage from './pages/PlayPage/PlayPage'
import RulesPage from './pages/RulesPage/RulesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
