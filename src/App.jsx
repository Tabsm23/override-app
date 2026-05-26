import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Override from './override.jsx'
import OverridePricing from './override-pricing.jsx'
import Auth from './Auth.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Override />} />
        <Route path="/program" element={<Override />} />
        <Route path="/pricing" element={<OverridePricing />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
