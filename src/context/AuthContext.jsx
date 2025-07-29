import * as React from 'react'
import { auth } from '../lib/supabase'

const { createContext, useContext, useEffect, useState } = React

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    auth.getCurrentUser().then(({ user }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await auth.signUp(email, password)
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}