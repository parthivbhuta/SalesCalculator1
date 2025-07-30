import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calculator, Users, BarChart3, Home, Building, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

const { useState } = React

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clients', href: '/clients', icon: Building },
  { name: 'Client Info', href: '/client-info', icon: Users },
  { name: 'Cost Inputs', href: '/cost-inputs', icon: Calculator },
  { name: 'Consulting', href: '/consulting-inputs', icon: BarChart3 },
  { name: 'Results', href: '/results', icon: BarChart3 },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <img 
                    src="/NewEPMA logo.png" 
                    alt="EPMA Logo" 
                    className="h-12 w-auto mr-4"
                  />
                  <h1 className="text-sm font-medium text-gray-900">Sales Cost Calculator</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex space-x-8">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                            isActive
                              ? 'text-primary-600 border-b-2 border-primary-600'
                              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {user.email.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase()).join('')}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {user ? children : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Sales Cost Calculator</h2>
              <p className="text-gray-600 mb-6">
                Sign in to start creating professional project cost analyses and save your client data securely.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-lg px-8 py-3"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}