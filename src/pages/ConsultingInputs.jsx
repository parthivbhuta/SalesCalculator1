import * as React from 'react'
const { useState } = React
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DollarSign, Calculator, ArrowRight, Save, TrendingUp, Target, Users, Clock } from 'lucide-react'

export default function ConsultingInputs() {
  const { state, dispatch, saveClientToDatabase } = useApp()
  const navigate = useNavigate()
  const [consultingData, setConsultingData] = useState({
    consultingFee: state.consultingInputs?.consultingFee || 75000,
    supportCost: state.consultingInputs?.supportCost || 25000,
    implementationTimeframe: state.consultingInputs?.implementationTimeframe || 6,
    expectedWasteReduction: state.consultingInputs?.expectedWasteReduction || 60,
    ongoingSupportMonths: state.consultingInputs?.ongoingSupportMonths || 12
  })
  const [saving, setSaving] = useState(false)

  const { calculations, costInputs } = state

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericValue = parseFloat(value) || 0
    setConsultingData(prev => ({ ...prev, [name]: numericValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    dispatch({ type: 'UPDATE_CONSULTING_INPUTS', payload: consultingData })
    
    try {
      dispatch({ type: 'SAVE_CURRENT_CLIENT' })
      
      const currentClient = {
        id: state.currentClientId,
        clientInfo: state.clientInfo,
        costInputs: state.costInputs,
        consultingInputs: consultingData,
        calculations: state.calculations,
        status: 'completed'
      }
      
      await saveClientToDatabase(currentClient)
      navigate('/results')
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save consulting inputs. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    dispatch({ type: 'UPDATE_CONSULTING_INPUTS', payload: consultingData })
    
    try {
      dispatch({ type: 'SAVE_CURRENT_CLIENT' })
      
      const currentClient = {
        id: state.currentClientId,
        clientInfo: state.clientInfo,
        costInputs: state.costInputs,
        consultingInputs: consultingData,
        calculations: state.calculations,
        status: state.calculations?.totalCost > 0 ? 'completed' : 'draft'
      }
      
      await saveClientToDatabase(currentClient)
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save consulting inputs. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Calculate preview ROI metrics
  const annualWaste = calculations?.totalWaste * costInputs?.projectsPerYear || 0
  const annualSavings = annualWaste * (consultingData.expectedWasteReduction / 100)
  const totalInvestment = consultingData.consultingFee + consultingData.supportCost
  const netSavings = annualSavings - totalInvestment
  const roi = totalInvestment > 0 ? Math.round((netSavings / totalInvestment) * 100) : 0
  const paybackMonths = annualSavings > 0 ? Math.ceil(totalInvestment / (annualSavings / 12)) : 0

  const inputSections = [
    {
      title: 'Consulting Investment',
      icon: DollarSign,
      color: 'text-green-600',
      description: 'Define the consulting engagement parameters',
      fields: [
        { 
          name: 'consultingFee', 
          label: 'Consulting Fee ($)', 
          min: 10000, 
          max: 500000, 
          help: 'Core consulting fee for analysis, strategy, and implementation guidance' 
        },
        { 
          name: 'supportCost', 
          label: 'Ongoing Support Cost ($)', 
          min: 0, 
          max: 200000, 
          help: 'Additional cost for ongoing support, monitoring, and maintenance during the support period' 
        },
        { 
          name: 'implementationTimeframe', 
          label: 'Implementation Timeframe (months)', 
          min: 1, 
          max: 24, 
          help: 'Expected time to implement recommended improvements' 
        }
      ]
    },
    {
      title: 'Expected Outcomes',
      icon: Target,
      color: 'text-blue-600',
      description: 'Set realistic expectations for improvement results',
      fields: [
        { 
          name: 'expectedWasteReduction', 
          label: 'Expected Waste Reduction (%)', 
          min: 20, 
          max: 90, 
          help: 'Percentage of current waste that can realistically be eliminated' 
        },
        { 
          name: 'ongoingSupportMonths', 
          label: 'Ongoing Support Period (months)', 
          min: 0, 
          max: 36, 
          help: 'Duration of ongoing support and monitoring included in the fee' 
        }
      ]
    }
  ]

  if (!calculations || calculations.totalCost === 0) {
    return (
      <div className="text-center py-12">
        <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Cost Analysis First</h2>
        <p className="text-gray-600 mb-6">Please complete the cost inputs to configure consulting parameters.</p>
        <a href="/cost-inputs" className="btn-primary">
          Go to Cost Inputs
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Consulting Engagement Parameters</h1>
        <p className="text-gray-600 text-lg">
          Configure the consulting engagement details to calculate accurate ROI projections and payback periods 
          for your waste reduction initiative.
        </p>
      </div>

      {/* Current Situation Overview */}
      <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-8">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Current Waste Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <p className="text-2xl font-bold text-red-900">${calculations.totalWaste.toLocaleString()}</p>
            <p className="text-sm text-red-700">Waste per project</p>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <p className="text-2xl font-bold text-red-900">${annualWaste.toLocaleString()}</p>
            <p className="text-sm text-red-700">Annual waste</p>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <p className="text-2xl font-bold text-red-900">{calculations.metrics.wastePercentage}%</p>
            <p className="text-sm text-red-700">Of budget wasted</p>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <p className="text-2xl font-bold text-red-900">{costInputs.projectsPerYear}</p>
            <p className="text-sm text-red-700">Projects per year</p>
          </div>
        </div>
      </div>

      {/* ROI Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Projected ROI</p>
              <p className="text-2xl font-bold text-green-900">{roi}%</p>
              <p className="text-xs text-green-600">Annual return</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Annual Savings</p>
              <p className="text-2xl font-bold text-blue-900">${annualSavings.toLocaleString()}</p>
              <p className="text-xs text-blue-600">After implementation</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Payback Period</p>
              <p className="text-2xl font-bold text-purple-900">{paybackMonths}</p>
              <p className="text-xs text-purple-600">Months to break even</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Target className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">Net Savings</p>
              <p className="text-2xl font-bold text-yellow-900">${netSavings.toLocaleString()}</p>
              <p className="text-xs text-yellow-600">Year 1 profit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Investment Summary */}
      <div className="card bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <p className="text-xl font-bold text-blue-900">${consultingData.consultingFee.toLocaleString()}</p>
            <p className="text-sm text-blue-700">Consulting Fee</p>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <p className="text-xl font-bold text-purple-900">${consultingData.supportCost.toLocaleString()}</p>
            <p className="text-sm text-purple-700">Support Cost</p>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <p className="text-xl font-bold text-green-900">${totalInvestment.toLocaleString()}</p>
            <p className="text-sm text-green-700">Total Investment</p>
          </div>
        </div>
      </div>

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
                      value={consultingData[field.name]}
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

        {/* ROI Scenarios Preview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">ROI Scenario Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Conservative', reduction: (consultingData.expectedWasteReduction / 100) * 0.5, label: `${Math.round(consultingData.expectedWasteReduction * 0.5)}% Waste Reduction` },
              { name: 'Realistic', reduction: consultingData.expectedWasteReduction / 100, label: `${consultingData.expectedWasteReduction}% Waste Reduction` },
              { name: 'Optimistic', reduction: (consultingData.expectedWasteReduction / 100) * 1.5, label: `${Math.round(consultingData.expectedWasteReduction * 1.5)}% Waste Reduction` }
            ].map((scenario, index) => {
              const scenarioSavings = annualWaste * scenario.reduction
              const scenarioNet = scenarioSavings - totalInvestment
              const scenarioROI = totalInvestment > 0 ? Math.round((scenarioNet / totalInvestment) * 100) : 0
              
              return (
                <div key={scenario.name} className={`p-4 rounded-lg border-2 ${
                  index === 1 ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                    {index === 1 && <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">Your Target</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{scenario.label}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">Annual Savings: <span className="font-semibold">${scenarioSavings.toLocaleString()}</span></p>
                    <p className="text-gray-700">Net Profit: <span className="font-semibold">${scenarioNet.toLocaleString()}</span></p>
                    <p className="text-gray-700">Total Investment: <span className="font-semibold">${totalInvestment.toLocaleString()}</span></p>
                    <p className="text-green-600 font-semibold">ROI: {scenarioROI}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

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
            {saving ? 'Saving...' : 'Generate ROI Analysis'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
    </div>
  )
}