import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import ClientsList from './pages/ClientsList'
import ClientInfo from './pages/ClientInfo'
import CostInputs from './pages/CostInputs'
import ConsultingInputs from './pages/ConsultingInputs'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/client-info" element={<ClientInfo />} />
          <Route path="/cost-inputs" element={<CostInputs />} />
          <Route path="/consulting-inputs" element={<ConsultingInputs />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}

export default App