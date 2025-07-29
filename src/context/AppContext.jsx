import * as React from 'react'
import { db } from '../lib/supabase'
import { useAuth } from './AuthContext'
const { createContext, useContext, useReducer } = React

const AppContext = createContext()

const initialState = {
  clients: [], // Array to store all client projects
  currentClientId: null, // ID of currently active client
  clientInfo: {
    name: '',
    company: '',
    email: '',
    phone: '',
    title: '',
    problemStatement: ''
  },
  costInputs: {
    // Project Fundamentals
    projectDuration: 6,
    teamSize: 8,
    hourlyRate: 85,
    inefficiencyPercentage: 15,
    
    // Communication & Collaboration
    meetingsPerWeek: 12,
    meetingDuration: 1,
    participantsPerMeeting: 4,
    communicationOverhead: 20,
    
    // Resource Management
    resourceUtilization: 75,
    idleTimePercentage: 12,
    resourceCostPerHour: 110,
    
    // Quality & Risk Management
    defectRate: 6,
    reworkCostMultiplier: 2.2,
    qualityAssuranceHours: 160,
    delayPercentage: 25,
    penaltyCostPerDay: 800,
    opportunityCostPerDay: 1500,
    
    // Organizational Scale
    projectsPerYear: 4
  },
  consultingInputs: {
    consultingFee: 75000,
    supportCost: 25000,
    implementationTimeframe: 6,
    expectedWasteReduction: 60,
    ongoingSupportMonths: 12
  },
  calculations: {
    totalCost: 0,
    breakdown: {},
    metrics: {}
  }
}

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CLIENTS':
      return {
        ...state,
        clients: action.payload.map(client => ({
          id: client.id,
          clientInfo: client.client_info || {},
          costInputs: client.cost_inputs || {},
          consultingInputs: client.consulting_inputs || {},
          calculations: client.calculations || {},
          status: client.status || 'draft',
          createdAt: client.created_at,
          updatedAt: client.updated_at
        }))
      }
    case 'ADD_CLIENT':
      const newClient = {
        id: generateId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      }
      return {
        ...state,
        clients: [...state.clients, newClient],
        currentClientId: newClient.id
      }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, ...action.payload, updatedAt: new Date().toISOString() }
            : client
        )
      }
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        currentClientId: state.currentClientId === action.payload ? null : state.currentClientId
      }
    case 'SET_CURRENT_CLIENT':
      const currentClient = state.clients.find(client => client.id === action.payload)
      if (currentClient) {
        return {
          ...state,
          currentClientId: action.payload,
          clientInfo: currentClient.clientInfo || initialState.clientInfo,
          costInputs: currentClient.costInputs || initialState.costInputs,
          consultingInputs: currentClient.consultingInputs || initialState.consultingInputs,
          calculations: currentClient.calculations || initialState.calculations
        }
      }
      return state
    case 'SAVE_CURRENT_CLIENT':
      if (!state.currentClientId) {
        // Create new client
        const newClient = {
          id: generateId(),
          clientInfo: state.clientInfo,
          costInputs: state.costInputs,
          consultingInputs: state.consultingInputs,
          calculations: state.calculations,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: state.calculations.totalCost > 0 ? 'completed' : 'draft'
        }
        return {
          ...state,
          clients: [...state.clients, newClient],
          currentClientId: newClient.id
        }
      } else {
        // Update existing client
        return {
          ...state,
          clients: state.clients.map(client =>
            client.id === state.currentClientId
              ? {
                  ...client,
                  clientInfo: state.clientInfo,
                  costInputs: state.costInputs,
                  consultingInputs: state.consultingInputs,
                  calculations: state.calculations,
                  updatedAt: new Date().toISOString(),
                  status: state.calculations.totalCost > 0 ? 'completed' : 'draft'
                }
              : client
          )
        }
      }
    case 'START_NEW_CLIENT':
      return {
        ...state,
        currentClientId: null,
        clientInfo: initialState.clientInfo,
        costInputs: initialState.costInputs,
        consultingInputs: initialState.consultingInputs,
        calculations: initialState.calculations
      }
    case 'UPDATE_CLIENT_INFO':
      return {
        ...state,
        clientInfo: { ...state.clientInfo, ...action.payload }
      }
    case 'UPDATE_COST_INPUTS':
      return {
        ...state,
        costInputs: { ...state.costInputs, ...action.payload }
      }
    case 'UPDATE_CONSULTING_INPUTS':
      return {
        ...state,
        consultingInputs: { ...state.consultingInputs, ...action.payload }
      }
    case 'UPDATE_CALCULATIONS':
      return {
        ...state,
        calculations: action.payload
      }
    case 'RESET_DATA':
      return {
        ...initialState
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { user } = useAuth()

  // Load clients from database when user signs in
  React.useEffect(() => {
    if (user) {
      loadClientsFromDatabase()
    } else {
      // Clear clients when user signs out
      dispatch({ type: 'RESET_DATA' })
    }
  }, [user])

  const loadClientsFromDatabase = async () => {
    try {
      const { data: clients, error } = await db.getClients()
      if (error) {
        console.error('Error loading clients:', error)
        return
      }
      
      if (clients) {
        dispatch({ type: 'LOAD_CLIENTS', payload: clients })
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const saveClientToDatabase = async (clientData) => {
    try {
      if (clientData.id) {
        // Update existing client
        const { data, error } = await db.updateClient(clientData.id, {
          client_info: clientData.clientInfo,
          cost_inputs: clientData.costInputs,
          consulting_inputs: clientData.consultingInputs,
          calculations: clientData.calculations,
          status: clientData.status
        })
        if (error) throw error
        return data
      } else {
        // Create new client
        const { data, error } = await db.createClient({
          client_info: clientData.clientInfo,
          cost_inputs: clientData.costInputs,
          consulting_inputs: clientData.consultingInputs,
          calculations: clientData.calculations,
          status: clientData.status
        })
        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error saving client:', error)
      throw error
    }
  }

  const deleteClientFromDatabase = async (clientId) => {
    try {
      const { error } = await db.deleteClient(clientId)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      saveClientToDatabase, 
      deleteClientFromDatabase,
      loadClientsFromDatabase 
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}