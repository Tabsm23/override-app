import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Override from './override.jsx'
import OverridePricing from './override-pricing.jsx'
import Auth from './Auth.jsx'
import Success from './Success.jsx'
import ResetPassword from './ResetPassword.jsx'
import Terms from './Terms.jsx'
import Privacy from './Privacy.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Override />} />
        <Route path="/program" element={<Override />} />
        <Route path="/pricing" element={<OverridePricing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
