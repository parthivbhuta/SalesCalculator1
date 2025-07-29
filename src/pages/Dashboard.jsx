import * as React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Users, Calculator, BarChart3, TrendingUp, Clock, DollarSign, Target, CheckCircle2, AlertCircle, Building } from 'lucide-react'

export default function Dashboard() {
  const { state } = useApp()
  const { clientInfo, calculations, costInputs, clients } = state

  const hasClientInfo = (clientInfo.name && clientInfo.company) || clients.length > 0
  const hasCalculations = calculations.totalCost > 0

  const quickStats = [
    {
      name: 'Project Investment',
      value: hasCalculations ? `$${calculations.totalCost.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
      description: 'Total estimated cost'
    },
    {
      name: 'Total Clients',
      value: clients.length.toString(),
      icon: Target,
      color: 'text-blue-600 bg-blue-100',
      description: 'Clients in system'
    },
    {
      name: 'Monthly Burn Rate',
      value: hasCalculations ? `$${calculations.metrics.monthlyBurnRate.toLocaleString()}` : '$0',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
      description: 'Average monthly cost'
    },
    {
      name: 'Efficiency Score',
      value: hasCalculations ? `${Math.round((100 - costInputs.inefficiencyPercentage))}%` : '0%',
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
      description: 'Process efficiency'
    }
  ]

  const completionStatus = [
    {
      step: 'Client Information',
      completed: hasClientInfo,
      description: 'Client details and project requirements captured'
    },
    {
      step: 'Cost Parameters',
      completed: true, // Always true as we have defaults
      description: 'Project parameters configured'
    },
    {
      step: 'Cost Analysis',
      completed: hasCalculations,
      description: 'Comprehensive cost breakdown generated'
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
        {!hasClientInfo && (
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

      {/* Progress Tracker */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Analysis Progress</h3>
        <div className="space-y-4">
          {completionStatus.map((status, index) => (
            <div key={status.step} className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                status.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {status.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
              </div>
              <div className="ml-4 flex-1">
                <h4 className={`font-medium ${status.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {status.step}
                </h4>
                <p className="text-sm text-gray-600">{status.description}</p>
              </div>
              {status.completed && (
                <span className="text-sm text-green-600 font-medium">Complete</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/clients" className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clients</h3>
              <p className="text-gray-600 text-sm">
                View and manage all client cost calculations
              </p>
            </div>
            <Building className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {clients.length} {clients.length === 1 ? 'Client' : 'Clients'}
            </span>
            <span className="text-sm text-gray-500">View all</span>
          </div>
        </Link>

        <Link to="/client-info" className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Information</h3>
              <p className="text-gray-600 text-sm">
                {hasClientInfo ? 'Update client details and requirements' : 'Capture client details and project scope'}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              hasClientInfo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {hasClientInfo ? 'Completed' : 'Pending'}
            </span>
            {hasClientInfo && <span className="text-sm text-gray-500">Ready to update</span>}
          </div>
        </Link>

        <Link to="/cost-inputs" className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Parameters</h3>
              <p className="text-gray-600 text-sm">
                Configure project parameters and calculate comprehensive costs
              </p>
            </div>
            <Calculator className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Ready
            </span>
            <span className="text-sm text-gray-500">Live calculations</span>
          </div>
        </Link>

        <Link to="/consulting-inputs" className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Consulting Setup</h3>
              <p className="text-gray-600 text-sm">
                Configure consulting parameters and ROI projections
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Configure
            </span>
            <span className="text-sm text-gray-500">ROI analysis</span>
          </div>
        </Link>

        <Link to="/results" className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Results</h3>
              <p className="text-gray-600 text-sm">
                {hasCalculations ? 'View comprehensive cost analysis and reports' : 'Generate detailed cost breakdown and insights'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              hasCalculations ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {hasCalculations ? 'Available' : 'Pending'}
            </span>
            {hasCalculations && <span className="text-sm text-gray-500">Export ready</span>}
          </div>
        </Link>
      </div>

      {/* Current Project Overview */}
      {hasClientInfo && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Current Project Overview</h3>
            <Link to="/clients" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All Clients →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="border-l-4 border-primary-500 pl-4 mb-4">
                <h4 className="font-semibold text-gray-900 text-lg">{clientInfo.company}</h4>
                <p className="text-gray-600">
                  <span className="font-medium">{clientInfo.name}</span>
                  {clientInfo.title && ` • ${clientInfo.title}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">{clientInfo.email}</p>
                {clientInfo.phone && <p className="text-sm text-gray-500">{clientInfo.phone}</p>}
              </div>
              
              {clientInfo.problemStatement && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Project Requirements</h5>
                  <p className="text-sm text-gray-700 italic">"{clientInfo.problemStatement}"</p>
                </div>
              )}
            </div>
            
            {hasCalculations && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">Project Investment</h5>
                  <p className="text-2xl font-bold text-green-900">${calculations.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-green-700">
                    {costInputs.projectDuration} months • {costInputs.teamSize} team members
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Monthly Rate</p>
                    <p className="text-lg font-semibold text-blue-900">
                      ${calculations.metrics.monthlyBurnRate.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Effective Rate</p>
                    <p className="text-lg font-semibold text-purple-900">
                      ${calculations.metrics.effectiveHourlyRate}/hr
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {!hasClientInfo && (
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