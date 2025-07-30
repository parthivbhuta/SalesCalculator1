import * as React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Users, Calculator, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Target, CheckCircle2, AlertCircle, Building, Calendar, Eye, Edit3 } from 'lucide-react'

export default function Dashboard() {
  const { state } = useApp()
  const { clients } = state

  // Calculate aggregate statistics
  const totalInvestment = clients.reduce((sum, client) => sum + (client.calculations?.totalCost || 0), 0)
  const totalWaste = clients.reduce((sum, client) => sum + (client.calculations?.totalWaste || 0), 0)
  const totalPotentialSavings = clients.reduce((sum, client) => sum + (client.calculations?.metrics?.potentialSavings || 0), 0)
  const completedClients = clients.filter(c => c.status === 'completed').length
  const averageEfficiency = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + (client.calculations?.metrics?.efficiencyRating || 0), 0) / clients.length)
    : 0

  // Get last 5 entries sorted by updated date
  const recentEntries = clients
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const quickStats = [
    {
      name: 'Total Project Investment',
      value: formatCurrency(totalInvestment),
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
      description: 'Sum of all client projects'
    },
    {
      name: 'Total Waste Identified',
      value: formatCurrency(totalWaste),
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100',
      description: 'Inefficiencies across all projects'
    },
    {
      name: 'Potential Savings',
      value: formatCurrency(totalPotentialSavings),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
      description: 'Total savings opportunity'
    },
    {
      name: 'Average Efficiency',
      value: `${averageEfficiency}%`,
      icon: Target,
      color: 'text-purple-600 bg-purple-100',
      description: 'Across all projects'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sales Cost Calculator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Transform your sales process with data-driven project cost analysis. Generate professional, 
          accurate estimates that win deals and build client confidence.
        </p>
        {clients.length === 0 && (
          <Link to="/client-info" className="btn-primary text-lg px-8 py-3">
            Start New Project Analysis
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Entries Table */}
      {clients.length > 0 ? (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Client Entries</h3>
            <Link to="/clients" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All Clients →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEntries.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.clientInfo?.name || 'No name'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.clientInfo?.company || 'No company'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {client.calculations?.totalCost ? formatCurrency(client.calculations.totalCost) : 'Not calculated'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'completed' ? 'bg-green-100 text-green-800' :
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        client.status === 'archived' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status === 'completed' ? 'Completed' :
                         client.status === 'pending' ? 'Pending' :
                         client.status === 'archived' ? 'Archived' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(client.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to="/client-info"
                          onClick={() => {
                            // Set current client when editing
                            // This will be handled by the context
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit client"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {client.calculations?.totalCost > 0 && (
                          <Link
                            to="/results"
                            onClick={() => {
                              // Set current client when viewing results
                              // This will be handled by the context
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="View results"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first client cost analysis</p>
          <Link to="/client-info" className="btn-primary">
            Create First Client
          </Link>
        </div>
      )}

      {/* Getting Started Guide */}
      {clients.length === 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started in 3 Simple Steps</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>1. <strong>Enter Client Information</strong> - Capture client details and project requirements</p>
                <p>2. <strong>Configure Parameters</strong> - Set project timeline, team size, and risk factors</p>
                <p>3. <strong>Generate Analysis</strong> - Get comprehensive cost breakdown with professional charts</p>
              </div>
              <div className="mt-4">
                <Link to="/client-info" className="btn-primary">
                  Start Your First Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}