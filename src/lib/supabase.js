import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Get all clients for the current user
  getClients: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })
    
    return { data, error }
  },

  // Get a specific client by ID
  getClient: async (id) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Create a new client
  createClient: async (clientData) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id: user.id,
        ...clientData
      }])
      .select()
      .single()
    
    return { data, error }
  },

  // Update an existing client
  updateClient: async (id, updates) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Delete a client
  deleteClient: async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Get clients by status
  getClientsByStatus: async (status) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false })
    
    return { data, error }
  }
}