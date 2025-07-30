import * as React from 'react'
const { useState, useEffect } = React
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calculateCosts } from '../utils/calculations'
import { Calculator, Clock, Users, Target, AlertTriangle, ArrowRight, Save, TrendingUp, DollarSign, TrendingDown, Building } from 'lucide-react'

export default function CostInputs() {
  const { state, dispatch, saveClientToDatabase } = useApp()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(state.costInputs)
  const [calculations, setCalculations] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericValue = parseFloat(value) || 0
    setFormData(prev => ({ ...prev, [name]: numericValue }))
  }

  useEffect(() => {
    const results = calculateCosts(formData)
    setCalculations(results)
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    dispatch({ type: 'UPDATE_COST_INPUTS', payload: formData })
    dispatch({ type: 'UPDATE_CALCULATIONS', payload: calculations })
    
    try {
      // Save to database (this will also update local state)
      await saveClientToDatabase()
      navigate('/consulting-inputs')
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save cost inputs. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    dispatch({ type: 'UPDATE_COST_INPUTS', payload: formData })
    if (calculations) {
      dispatch({ type: 'UPDATE_CALCULATIONS', payload: calculations })
      
      try {
        // Save to database (this will also update local state)
        await saveClientToDatabase()
      } catch (error) {
        console.error('Error saving client:', error)
        alert('Failed to save cost inputs. Please try again.')
      }
    }
    setSaving(false)
  }

  const inputSections = [
    {
      title: 'Project Fundamentals',
      icon: Target,
      color: 'text-blue-600',
      description: 'Core project parameters that drive all other calculations',
      fields: [
        { name: 'projectDuration', label: 'Project Duration (months)', min: 1, max: 60, help: 'Total expected project timeline' },
        { name: 'teamSize', label: 'Team Size (people)', min: 1, max: 100, help: 'Number of team members working on the project' },
        { name: 'hourlyRate', label: 'Average Hourly Rate ($)', min: 25, max: 300, help: 'Blended hourly rate across all team members' },
        { name: 'inefficiencyPercentage', label: 'Process Inefficiency (%)', min: 0, max: 50, help: 'Expected inefficiencies due to poor processes' },
      ]
    },
    {
      title: 'Communication & Collaboration',
      icon: Users,
      color: 'text-green-600',
      description: 'Costs associated with team communication and coordination',
      fields: [
        { name: 'meetingsPerWeek', label: 'Meetings per Week', min: 1, max: 50, help: 'Average number of meetings per week' },
        { name: 'meetingDuration', label: 'Average Meeting Duration (hours)', min: 0.25, max: 8, step: 0.25, help: 'Typical length of meetings' },
        { name: 'participantsPerMeeting', label: 'Participants per Meeting', min: 2, max: 20, help: 'Average attendees per meeting' },
        { name: 'communicationOverhead', label: 'Communication Overhead (%)', min: 0, max: 50, help: 'Additional time spent on emails, calls, documentation' },
      ]
    },
    {
      title: 'Resource Management',
      icon: Clock,
      color: 'text-purple-600',
      description: 'Efficiency and utilization of project resources',
      fields: [
        { name: 'resourceUtilization', label: 'Resource Utilization (%)', min: 30, max: 100, help: 'Percentage of time resources are productively used' },
        { name: 'idleTimePercentage', label: 'Idle Time (%)', min: 0, max: 40, help: 'Time when resources are waiting or blocked' },
        { name: 'resourceCostPerHour', label: 'Fully Loaded Cost per Hour ($)', min: 30, max: 400, help: 'Total cost including benefits, overhead, etc.' },
      ]
    },
    {
      title: 'Quality & Risk Management',
      icon: AlertTriangle,
      color: 'text-red-600',
      description: 'Quality assurance and risk mitigation costs',
      fields: [
        { name: 'defectRate', label: 'Expected Defect Rate (%)', min: 0, max: 30, help: 'Percentage of work requiring rework' },
        { name: 'reworkCostMultiplier', label: 'Rework Cost Multiplier', min: 1, max: 5, step: 0.1, help: 'How much more expensive rework is vs. initial work' },
        { name: 'qualityAssuranceHours', label: 'QA Hours', min: 50, max: 2000, help: 'Dedicated quality assurance effort' },
        { name: 'delayPercentage', label: 'Expected Delays (%)', min: 0, max: 100, help: 'Percentage of timeline likely to be delayed' },
        { name: 'penaltyCostPerDay', label: 'Penalty Cost per Day ($)', min: 0, max: 10000, help: 'Financial penalties for late delivery' },
        { name: 'opportunityCostPerDay', label: 'How much more money can you make with the time saved ($)', min: 0, max: 20000, help: 'Additional revenue or business value you could generate per day if the project finished on time' },
      ]
    },
    {
      title: 'Organizational Scale',
      icon: Building,
      color: 'text-indigo-600',
      description: 'Scale this analysis to your full organization',
      fields: [
        { name: 'projectsPerYear', label: 'Similar Projects per Year', min: 1, max: 50, help: 'How many similar projects does your organization run annually?' },
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Project Cost Parameters</h1>
        <p className="text-gray-600 text-lg">
          Configure the parameters below to calculate comprehensive project costs. The system provides real-time 
          calculations based on industry best practices and your specific project characteristics.
        </p>
      </div>

      {calculations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Current Waste Cost</p>
                <p className="text-2xl font-bold text-red-900">
                  ${calculations.totalWaste.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">Per project</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Current Total Cost</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${calculations.totalCost.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">Per project</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Potential Savings</p>
                <p className="text-2xl font-bold text-green-900">
                  ${calculations.metrics.potentialSavings.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Per project</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Building className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Annual Waste</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${calculations.metrics.annualWaste.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600">{formData.projectsPerYear} projects/year</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Impact Alert */}
      {calculations && calculations.metrics.annualWaste > 200000 && (
        <div className="card bg-gradient-to-r from-red-50 to-pink-50 border-red-300 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-8 h-8 text-red-600 mt-1 mr-4" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-3">Critical: Your Organization is Losing Significant Money</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">${calculations.metrics.annualWaste.toLocaleString()}</p>
                  <p className="text-sm text-red-700">Annual waste across all projects</p>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">${Math.round(calculations.metrics.annualWaste / 12).toLocaleString()}</p>
                  <p className="text-sm text-red-700">Monthly waste</p>
                </div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">${calculations.metrics.annualPotentialSavings.toLocaleString()}</p>
                  <p className="text-sm text-green-700">Annual savings potential</p>
                </div>
              </div>
              <p className="text-red-800">
                <strong>This level of waste demands immediate attention.</strong> Our consulting services typically pay for themselves 
                within 2-3 months and deliver 300-500% ROI in the first year.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Pitch Alert */}
      {calculations && calculations.metrics.wastePercentage > 20 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Significant Inefficiency Detected!</h3>
              <p className="text-yellow-800 mb-2">
                Your project is currently wasting <strong>{calculations.metrics.wastePercentage}%</strong> of its budget 
                (${calculations.totalWaste.toLocaleString()}) due to process inefficiencies.
              </p>
              <p className="text-yellow-700 text-sm">Our consulting services could help you recover up to 70% of these losses.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {inputSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="card">
              <div className="mb-6">
                <h2 className={`text-xl font-semibold mb-2 flex items-center ${section.color}`}>
                  <Icon className="w-6 h-6 mr-3" />
                  {section.title}
                </h2>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label htmlFor={field.name} className="form-label">
                      {field.label}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      className="input"
                      required
                      title={field.help}
                    />
                    {field.help && (
                      <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Parameters'}
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center text-lg px-8 py-3"
          >
            <Calculator className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Generate Detailed Results'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
    </div>
  )
}