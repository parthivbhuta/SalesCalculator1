import * as React from 'react'
const { useState } = React
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Save, ArrowRight, User, Building, Mail, Phone, Briefcase, MessageSquare } from 'lucide-react'

export default function ClientInfo() {
  const { state, dispatch, saveClientToDatabase } = useApp()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(state.clientInfo)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    dispatch({ type: 'UPDATE_CLIENT_INFO', payload: formData })
    
    try {
      // Save to database (this will also update local state)
      await saveClientToDatabase()
      navigate('/cost-inputs')
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save client data. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    dispatch({ type: 'UPDATE_CLIENT_INFO', payload: formData })
    
    try {
      // Save to database (this will also update local state)
      await saveClientToDatabase()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save client data. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    { name: 'name', label: 'Client Name', type: 'text', icon: User, required: true },
    { name: 'company', label: 'Company Name', type: 'text', icon: Building, required: true },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone },
    { name: 'title', label: 'Job Title', type: 'text', icon: Briefcase },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Client Information</h1>
        <p className="text-gray-600">
          Enter your client's details and their project requirements to get started with the cost calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => {
              const Icon = field.icon
              return (
                <div key={field.name} className="form-group">
                  <label htmlFor={field.name} className="form-label flex items-center">
                    <Icon className="w-4 h-4 mr-2 text-gray-500" />
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    className="input"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
            Project Requirements
          </h2>
          
          <div className="form-group">
            <label htmlFor="problemStatement" className="form-label">
              Problem Statement / Project Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="problemStatement"
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleChange}
              required
              rows={4}
              className="input resize-none"
              placeholder="Describe the client's current challenges, pain points, and what they hope to achieve with this project..."
            />
            <p className="text-sm text-gray-500 mt-1">
              This information will help tailor the cost calculation to their specific needs.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? 'Saving...' : 'Continue to Cost Inputs'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  )
}