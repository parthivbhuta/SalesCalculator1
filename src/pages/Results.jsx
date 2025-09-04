import * as React from 'react'
import { useApp } from '../context/AppContext'
import { calculateConsultingROI, getWasteReductionOpportunities } from '../utils/calculations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { Download, Mail, Printer, TrendingUp, DollarSign, Clock, AlertCircle, Target, Users, CheckCircle, ArrowUp, ArrowDown, Zap, Shield, TrendingDown, Lightbulb, FileText, Presentation, FileSpreadsheet } from 'lucide-react'
import { exportToPDF, exportToWord, exportToPowerPoint, exportAll } from '../utils/exportUtils'

const { useState } = React

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']

export default function Results() {
  const { state } = useApp()
  const { clientInfo, calculations, costInputs } = state
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  const handleExport = async (type) => {
    setExporting(true)
    setExportStatus(`Exporting ${type}...`)
    
    try {
      let result
      const elementId = 'results-content'
      
      switch (type) {
        case 'pdf':
          result = await exportToPDF(elementId)
          break
        case 'word':
          result = await exportToWord(elementId)
          break
        case 'powerpoint':
          result = await exportToPowerPoint(elementId)
          break
        case 'all':
          result = await exportAll(elementId)
          break
        default:
          throw new Error('Unknown export type')
      }
      
      setExportStatus(result.message)
      setTimeout(() => setExportStatus(''), 3000)
    } catch (error) {
      setExportStatus('Export failed: ' + error.message)
      setTimeout(() => setExportStatus(''), 5000)
    } finally {
      setExporting(false)
    }
  }

  if (!calculations || calculations.totalCost === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h2>
        <p className="text-gray-600 mb-6">Please complete the cost inputs to generate comprehensive results.</p>
        <a href="/cost-inputs" className="btn-primary">
          Configure Cost Parameters
        </a>
      </div>
    )
  }

  const { wasteBreakdown, metrics } = calculations
  const consultingROI = calculateConsultingROI(calculations.totalWaste, state.consultingInputs, costInputs.projectsPerYear)
  const wasteOpportunities = getWasteReductionOpportunities(calculations.wasteBreakdown, calculations.totalWaste)

  // Create chart data for efficient cost vs current waste
  const costComparisonData = [
    {
      name: 'Efficient Project Cost',
      value: calculations.efficientCost,
      percentage: ((calculations.efficientCost / calculations.totalCost) * 100).toFixed(1),
      fill: '#10B981'
    },
    {
      name: 'Current Waste',
      value: calculations.totalWaste,
      percentage: ((calculations.totalWaste / calculations.totalCost) * 100).toFixed(1),
      fill: '#EF4444'
    }
  ]

  // Detailed breakdown of waste costs
  const wasteBreakdownData = Object.entries(calculations.wasteBreakdown).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Costs', '').replace('And', '&').trim(),
    value: value,
    percentage: ((value / calculations.totalWaste) * 100).toFixed(1)
  }))

  const pieData = wasteBreakdownData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))

  const timelineData = Array.from({ length: costInputs.projectDuration }, (_, i) => {
    const month = i + 1
    const cumulativePercentage = Math.min(100, (month / costInputs.projectDuration) * 100 + (month * 2))
    return {
      month: `Month ${month}`,
      cumulative: Math.round((calculations.totalCost * cumulativePercentage) / 100),
      monthly: Math.round(calculations.totalCost / costInputs.projectDuration)
    }
  })

  const keyMetrics = [
    {
      label: 'Efficient Project Cost',
      value: `$${calculations.efficientCost.toLocaleString()}`,
      icon: Target,
      color: 'text-green-600 bg-green-100',
      change: `What you should pay`,
      changeType: 'neutral'
    },
    {
      label: 'Current Waste',
      value: `$${calculations.totalWaste.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100',
      change: `${metrics.wastePercentage}% of budget`,
      changeType: 'increase'
    },
    {
      label: 'Current Total Cost',
      value: `$${calculations.totalCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-100',
      change: `What you're paying now`,
      changeType: 'neutral'
    },
    {
      label: 'Potential Savings',
      value: `${metrics.efficiencyRating}%`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      change: `$${metrics.potentialSavings.toLocaleString()}`,
      changeType: 'neutral'
    }
  ]

  const riskFactors = [
    {
      factor: 'Timeline Risk',
      level: costInputs.delayPercentage > 25 ? 'High' : costInputs.delayPercentage > 15 ? 'Medium' : 'Low',
      impact: `${costInputs.delayPercentage}% delay probability`,
      cost: wasteBreakdown.delayPenalties + wasteBreakdown.opportunityCosts
    },
    {
      factor: 'Quality Risk', 
      level: costInputs.defectRate > 15 ? 'High' : costInputs.defectRate > 8 ? 'Medium' : 'Low',
      impact: `${costInputs.defectRate}% defect rate`,
      cost: wasteBreakdown.qualityRework
    },
    {
      factor: 'Resource Risk',
      level: costInputs.resourceUtilization < 70 ? 'High' : costInputs.resourceUtilization < 85 ? 'Medium' : 'Low',
      impact: `${costInputs.resourceUtilization}% utilization`,
      cost: wasteBreakdown.resourceUnderutilization + wasteBreakdown.idleTime
    }
  ]

  return (
    <div id="results-content" className="results-container space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="section-title">Project Inefficiency Analysis</h1>
          {clientInfo.company && (
            <div className="text-gray-600">
              <p className="font-semibold text-lg">{clientInfo.company}</p>
              <p className="text-sm">{clientInfo.name} • {clientInfo.email}</p>
              {clientInfo.problemStatement && (
                <p className="text-sm italic mt-2 max-w-2xl">"{clientInfo.problemStatement}"</p>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          {exportStatus && (
            <div className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              {exportStatus}
            </div>
          )}
          <button className="btn-secondary flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email Report
          </button>
          <button className="btn-secondary flex items-center">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="btn-primary flex items-center" disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-3 text-red-500" />
                  Export as PDF
                  <span className="ml-auto text-xs text-gray-500">Print-ready</span>
                </button>
                
                <button
                  onClick={() => handleExport('word')}
                  disabled={exporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-blue-500" />
                  Export as Word
                  <span className="ml-auto text-xs text-gray-500">Editable</span>
                </button>
                
                <button
                  onClick={() => handleExport('powerpoint')}
                  disabled={exporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Presentation className="w-4 h-4 mr-3 text-orange-500" />
                  Export as PowerPoint
                  <span className="ml-auto text-xs text-gray-500">Presentation</span>
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => handleExport('all')}
                  disabled={exporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center font-medium"
                >
                  <Download className="w-4 h-4 mr-3 text-green-500" />
                  Export All Formats
                  <span className="ml-auto text-xs text-gray-500">PDF + Word + PPT</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Legacy button for backwards compatibility */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="btn-secondary flex items-center"
            title="Quick PDF export"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Quick PDF'}
          </button>
        </div>
      </div>

      {/* Executive Summary - Sales Focused */}
      <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-start">
          <div className="p-4 bg-red-100 rounded-lg mr-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-red-900 mb-3">Your Organization is Losing Serious Money</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-900">${calculations.metrics.annualWaste.toLocaleString()}</p>
                <p className="text-sm text-red-700">Annual waste</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-900">${Math.round(calculations.metrics.annualWaste / 12).toLocaleString()}</p>
                <p className="text-sm text-red-700">Monthly waste</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-900">{metrics.wastePercentage}%</p>
                <p className="text-sm text-red-700">Of budget wasted</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-900">${calculations.metrics.annualPotentialSavings.toLocaleString()}</p>
                <p className="text-sm text-green-700">Annual savings potential</p>
              </div>
            </div>
            <p className="text-red-800 text-lg">
              <strong>The good news:</strong> Running {costInputs.projectsPerYear} similar projects annually means huge savings potential. 
              Our consulting services typically help clients recover 60-80% of these losses, delivering 300-500% ROI in year one.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="card">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center justify-end mt-1">
                    {metric.changeType === 'increase' && <ArrowUp className="w-3 h-3 text-red-500 mr-1" />}
                    {metric.changeType === 'decrease' && <ArrowDown className="w-3 h-3 text-green-500 mr-1" />}
                    <span className={`text-xs ${
                      metric.changeType === 'increase' ? 'text-red-600' : 
                      metric.changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Efficient Cost vs Current Waste Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Reality Check</h3>
          <div className="space-y-4 mb-6">
            {costComparisonData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-lg border-2" style={{ borderColor: item.fill + '40', backgroundColor: item.fill + '10' }}>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-3" style={{ backgroundColor: item.fill }}></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.percentage}% of total cost</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">${item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h5 className="font-medium text-red-900 mb-2">The Problem</h5>
            <p className="text-sm text-red-800">
              You're paying <strong>{metrics.wastePercentage}% more</strong> than necessary due to process inefficiencies. 
              This waste compounds across every project, costing your organization significant money annually.
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Where Your Money is Being Wasted</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                fontSize={11}
              />
              <Tooltip 
                formatter={(value, name) => [`$${value.toLocaleString()}`, 'Cost']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consulting ROI Scenarios */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">ROI of Our Consulting Services (Annual Impact)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {consultingROI.map((scenario, index) => (
            <div key={scenario.name} className={`p-4 rounded-lg border-2 ${
              index === 1 ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                {index === 1 && <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">Recommended</span>}
              </div>
              <p className="text-2xl font-bold text-green-900 mb-2">{scenario.roi} ROI</p>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">Annual Savings: <span className="font-semibold">${scenario.annualSavings.toLocaleString()}</span></p>
                <p className="text-gray-700">Total Investment: <span className="font-semibold">${scenario.totalInvestment.toLocaleString()}</span></p>
                <p className="text-gray-600 text-xs">Consulting: ${scenario.consultingFee.toLocaleString()} + Support: ${scenario.supportCost.toLocaleString()}</p>
                <p className="text-gray-700">Payback: <span className="font-semibold">{scenario.paybackPeriod}</span></p>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Net Savings: ${scenario.netSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-2">Why This ROI is Realistic</h5>
          <p className="text-sm text-blue-800">
            Based on {costInputs.projectsPerYear} projects per year with ${calculations.totalWaste.toLocaleString()} waste per project. 
            Our methodology focuses on the highest-impact inefficiencies first, typically achieving 60-80% waste reduction within 6 months.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waste Breakdown Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Waste Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                fontSize={11}
              />
              <Tooltip 
                formatter={(value, name) => [`$${value.toLocaleString()}`, 'Cost']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Waste Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percentage }) => `${percentage}%`}
                labelLine={false}
                fontSize={11}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: item.fill }}
                ></div>
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance vs Industry Benchmarks by Category */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Performance vs Industry Benchmarks by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={[
              { 
                category: 'Process Efficiency', 
                yourPerformance: Math.max(30, 100 - ((costInputs?.inefficiencyPercentage || 15) * 2.5)),
                industryAverage: 80, 
                bestPractice: 95 
              },
              { 
                category: 'Meeting Efficiency', 
                yourPerformance: Math.max(25, 100 - ((costInputs?.meetingsPerWeek || 12) * 2.5)),
                industryAverage: 75, 
                bestPractice: 90 
              },
              { 
                category: 'Communication', 
                yourPerformance: Math.max(35, 100 - ((costInputs?.communicationOverhead || 20) * 1.5)), 
                industryAverage: 85, 
                bestPractice: 95 
              },
              { 
                category: 'Resource Utilization', 
                yourPerformance: Math.max(40, (costInputs?.resourceUtilization || 75) * 0.7), 
                industryAverage: 80, 
                bestPractice: 90 
              },
              { 
                category: 'Quality Management', 
                yourPerformance: Math.max(35, 100 - ((costInputs?.defectRate || 6) * 6)),
                industryAverage: 92, 
                bestPractice: 98 
              },
              { 
                category: 'Timeline Management', 
                yourPerformance: Math.max(30, 100 - ((costInputs?.delayPercentage || 25) * 2)),
                industryAverage: 85, 
                bestPractice: 95 
              }
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
              interval={0}
            />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value, name) => [
              `${value}%`, 
              name === 'yourPerformance' ? 'Your Performance' : 
              name === 'industryAverage' ? 'Industry Average' : 'Best Practice'
            ]} />
            <Bar dataKey="yourPerformance" fill="#EF4444" name="yourPerformance" />
            <Bar dataKey="industryAverage" fill="#F59E0B" name="industryAverage" />
            <Bar dataKey="bestPractice" fill="#10B981" name="bestPractice" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-2"></div>
            <p className="text-sm text-red-600 font-medium">Your Performance</p>
            <p className="text-xs text-red-600">Shows significant gaps in multiple areas</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-2"></div>
            <p className="text-sm text-yellow-600 font-medium">Industry Average</p>
            <p className="text-xs text-yellow-600">Typical performance across organizations</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-2"></div>
            <p className="text-sm text-green-600 font-medium">Best Practice</p>
            <p className="text-xs text-green-600">What's achievable with optimization</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-2">Key Insights</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Biggest gaps:</strong> Areas where red bars are significantly below yellow/green</li>
            <li>• <strong>Quick wins:</strong> Categories where small changes yield big improvements</li>
            <li>• <strong>ROI potential:</strong> Larger gaps = higher savings opportunity</li>
          </ul>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
        <div className="space-y-4">
          {riskFactors.map((risk, index) => (
            <div key={risk.factor} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  risk.level === 'High' ? 'bg-red-500' : 
                  risk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                  <p className="text-sm text-gray-600">{risk.impact}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  risk.level === 'High' ? 'bg-red-100 text-red-800' : 
                  risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {risk.level} Risk
                </span>
                <p className="text-sm text-gray-600 mt-1">${risk.cost.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Reduction Opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Waste Reduction Opportunities</h3>
          <div className="flex items-center text-sm text-gray-600">
            <Lightbulb className="w-4 h-4 mr-1" />
            Based on your biggest waste sources
          </div>
        </div>
        <div className="space-y-4">
          {wasteOpportunities.map((opp, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              opp.priority === 'High' ? 'border-red-500 bg-red-50' :
              opp.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{opp.category}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    opp.priority === 'High' ? 'bg-red-100 text-red-800' :
                    opp.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {opp.priority} Priority
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Save ${opp.potentialSavings.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-2">{opp.solution}</p>
              <div className="flex justify-between text-xs text-gray-600">
                <span><strong>Current Waste:</strong> ${opp.currentWaste.toLocaleString()} ({opp.impactPercentage}%)</span>
                <span><strong>Implementation:</strong> {opp.timeToImplement}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-green-600 mr-2" />
            <h5 className="font-semibold text-green-900">Total Waste Reduction Potential</h5>
          </div>
          <p className="text-2xl font-bold text-green-900 mb-1">
            ${wasteOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-700">
            Our consulting services typically help clients achieve 60-80% of this potential savings within 3-6 months.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="card">
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Stop Wasting Money?</h2>
          <p className="text-xl text-gray-700 mb-6">
            You're currently losing <strong>${calculations.metrics.annualWaste.toLocaleString()}</strong> annually across {costInputs.projectsPerYear} similar projects. 
            That's <strong>${Math.round(calculations.metrics.annualWaste / 12).toLocaleString()}</strong> every single month.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">3-6 months</div>
              <div className="text-sm text-gray-600">Typical implementation time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">300-500%</div>
              <div className="text-sm text-gray-600">Average ROI on our services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">60-80%</div>
              <div className="text-sm text-gray-600">Waste reduction achieved</div>
            </div>
          </div>
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conservative Estimate: What You'll Save</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-600">${Math.round(calculations.metrics.annualPotentialSavings * 0.6).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Annual savings (60% waste reduction)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">${Math.round((calculations.metrics.annualPotentialSavings * 0.6) / 12).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Monthly savings</p>
              </div>
            </div>
          </div>
          <div className="space-x-4">
            <button className="btn-primary text-lg px-8 py-3">
              Schedule Free Consultation
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Download Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Waste Breakdown Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Waste Analysis</h3>
        <div>
          <h4 className="text-md font-semibold text-red-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            Current Waste Sources
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Waste Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Annual Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    % of Total Waste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Reduction Potential
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wasteBreakdownData.map((item, index) => (
                  <tr key={item.name} className={index % 2 === 0 ? 'bg-white' : 'bg-red-25'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ${(item.value * 4).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        60-80%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-100 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">
                    Total Annual Waste
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">
                    ${(calculations.totalWaste * 4).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">
                    100%
                  </td>
                  <td className="px-6 py-4 text-sm text-red-800">
                    Assuming 4 similar projects per year
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}