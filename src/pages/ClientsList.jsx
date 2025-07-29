import * as React from 'react'
const { useState, useMemo } = React
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  Building, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  MoreVertical,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  archived: { label: 'Archived', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}

export default function ClientsList() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { clients } = state

  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [groupBy, setGroupBy] = useState('none')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(false)

  // Filtering and sorting logic
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = 
        client.clientInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientInfo?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort clients
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.clientInfo?.name || ''
          bValue = b.clientInfo?.name || ''
          break
        case 'company':
          aValue = a.clientInfo?.company || ''
          bValue = b.clientInfo?.company || ''
          break
        case 'totalCost':
          aValue = a.calculations?.totalCost || 0
          bValue = b.calculations?.totalCost || 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    return filtered
  }, [clients, searchTerm, statusFilter, sortBy, sortOrder])

  // Group clients if needed
  const groupedClients = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Clients': filteredAndSortedClients }
    }

    const groups = {}
    filteredAndSortedClients.forEach(client => {
      let groupKey
      
      switch (groupBy) {
        case 'status':
          groupKey = STATUS_CONFIG[client.status]?.label || 'Unknown'
          break
        case 'month':
          groupKey = new Date(client.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })
          break
        case 'costRange':
          const cost = client.calculations?.totalCost || 0
          if (cost === 0) groupKey = 'No Cost Calculated'
          else if (cost < 50000) groupKey = 'Under $50K'
          else if (cost < 100000) groupKey = '$50K - $100K'
          else if (cost < 250000) groupKey = '$100K - $250K'
          else groupKey = 'Over $250K'
          break
        default:
          groupKey = 'All Clients'
      }

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(client)
    })

    return groups
  }, [filteredAndSortedClients, groupBy])

  const handleEditClient = (client) => {
    dispatch({ type: 'SET_CURRENT_CLIENT', payload: client.id })
    navigate('/client-info')
  }

  const handleViewResults = (client) => {
    dispatch({ type: 'SET_CURRENT_CLIENT', payload: client.id })
    navigate('/results')
  }

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      dispatch({ type: 'DELETE_CLIENT', payload: clientId })
    }
  }

  const handleStartNewClient = () => {
    dispatch({ type: 'START_NEW_CLIENT' })
    navigate('/client-info')
  }

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

  const ClientCard = ({ client }) => {
    const StatusIcon = STATUS_CONFIG[client.status]?.icon || FileText
    const totalCost = client.calculations?.totalCost || 0
    const monthlyRate = client.calculations?.metrics?.monthlyBurnRate || 0

    return (
      <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {client.clientInfo?.company || 'Unnamed Company'}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[client.status]?.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {STATUS_CONFIG[client.status]?.label}
              </span>
            </div>
            <p className="text-gray-600 flex items-center mb-2">
              <User className="w-4 h-4 mr-2" />
              {client.clientInfo?.name || 'No contact name'}
            </p>
            <p className="text-gray-500 text-sm mb-3">
              {client.clientInfo?.email || 'No email provided'}
            </p>
            {client.clientInfo?.problemStatement && (
              <p className="text-gray-600 text-sm italic mb-3 line-clamp-2">
                "{client.clientInfo.problemStatement.substring(0, 120)}..."
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Cost</p>
            <p className="text-lg font-bold text-green-900">
              {totalCost > 0 ? formatCurrency(totalCost) : 'Not calculated'}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Monthly Rate</p>
            <p className="text-lg font-bold text-blue-900">
              {monthlyRate > 0 ? formatCurrency(monthlyRate) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Created {formatDate(client.createdAt)}
          </span>
          <span>Updated {formatDate(client.updatedAt)}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditClient(client)}
              className="btn-secondary text-xs px-3 py-1 flex items-center"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </button>
            {totalCost > 0 && (
              <button
                onClick={() => handleViewResults(client)}
                className="btn-primary text-xs px-3 py-1 flex items-center"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Results
              </button>
            )}
          </div>
          <button
            onClick={() => handleDeleteClient(client.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const ClientRow = ({ client }) => {
    const StatusIcon = STATUS_CONFIG[client.status]?.icon || FileText
    const totalCost = client.calculations?.totalCost || 0

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {client.clientInfo?.company || 'Unnamed Company'}
              </div>
              <div className="text-sm text-gray-500">
                {client.clientInfo?.name || 'No contact'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {client.clientInfo?.email || 'No email'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[client.status]?.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {STATUS_CONFIG[client.status]?.label}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
          {totalCost > 0 ? formatCurrency(totalCost) : 'Not calculated'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(client.updatedAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleEditClient(client)}
              className="text-primary-600 hover:text-primary-900"
              title="Edit client"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {totalCost > 0 && (
              <button
                onClick={() => handleViewResults(client)}
                className="text-green-600 hover:text-green-900"
                title="View results"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDeleteClient(client.id)}
              className="text-red-600 hover:text-red-900"
              title="Delete client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="section-title">Clients & Projects</h1>
          <p className="text-gray-600">
            Manage all your client cost calculations and project analyses
          </p>
        </div>
        <button
          onClick={handleStartNewClient}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Client Analysis
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Building className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(clients.reduce((sum, client) => sum + (client.calculations?.totalCost || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients, companies, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Created</option>
                  <option value="name">Client Name</option>
                  <option value="company">Company Name</option>
                  <option value="totalCost">Total Cost</option>
                </select>
              </div>
              <div>
                <label className="form-label">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div>
                <label className="form-label">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="input"
                >
                  <option value="none">No Grouping</option>
                  <option value="status">Status</option>
                  <option value="month">Created Month</option>
                  <option value="costRange">Cost Range</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {clients.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first client cost analysis</p>
          <button
            onClick={handleStartNewClient}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Client
          </button>
        </div>
      ) : filteredAndSortedClients.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClients).map(([groupName, groupClients]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {groupName}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({groupClients.length} {groupClients.length === 1 ? 'client' : 'clients'})
                  </span>
                </h3>
              )}

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupClients.map(client => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <div className="card p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Cost
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
                        {groupClients.map(client => (
                          <ClientRow key={client.id} client={client} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}