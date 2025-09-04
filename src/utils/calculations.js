export function calculateCosts(inputs) {
  const {
    projectDuration,
    teamSize,
    hourlyRate,
    inefficiencyPercentage,
    meetingsPerWeek,
    meetingDuration,
    participantsPerMeeting,
    communicationOverhead,
    resourceUtilization,
    idleTimePercentage,
    resourceCostPerHour,
    defectRate,
    reworkCostMultiplier,
    qualityAssuranceHours,
    delayPercentage,
    penaltyCostPerDay,
    opportunityCostPerDay,
    projectsPerYear
  } = inputs

  // Base calculations
  const workingDaysPerMonth = 22
  const workingHoursPerDay = 8
  const totalWorkingHours = projectDuration * workingDaysPerMonth * workingHoursPerDay * teamSize

  // ===== EFFICIENT PROJECT COST (What they should be paying) =====
  const efficientLaborCost = totalWorkingHours * hourlyRate
  
  // ===== WASTE CALCULATIONS (Additional costs due to inefficiencies) =====
  
  // 1. Process Inefficiencies - Time wasted on poor processes
  const processWasteHours = totalWorkingHours * (inefficiencyPercentage / 100)
  const processWasteCost = processWasteHours * hourlyRate
  
  // 2. Excessive Meetings - Only count truly excessive meeting time
  const totalProjectWeeks = projectDuration * 4.33
  const weeklyMeetingHours = meetingsPerWeek * meetingDuration * participantsPerMeeting
  const totalMeetingHours = weeklyMeetingHours * totalProjectWeeks
  // Only count 15% of meeting time as excessive (more realistic)
  const excessiveMeetingHours = totalMeetingHours * 0.15
  const excessiveMeetingCost = excessiveMeetingHours * hourlyRate
  
  // 3. Communication Overhead - Time spent on inefficient communication
  const communicationWasteHours = totalWorkingHours * (communicationOverhead / 100)
  const communicationWasteCost = communicationWasteHours * hourlyRate
  
  // 4. Resource Underutilization - ONLY if utilization is below 85%
  // Most teams operate at 80-90% utilization, so only count waste below 85%
  const utilizationThreshold = 85
  const underutilizationPercentage = Math.max(0, utilizationThreshold - resourceUtilization)
  const underutilizationHours = totalWorkingHours * (underutilizationPercentage / 100)
  const underutilizationCost = underutilizationHours * hourlyRate
  
  // 5. Idle Time - Only count if it's above 5% (normal idle time)
  const excessiveIdlePercentage = Math.max(0, idleTimePercentage - 5)
  const idleHours = totalWorkingHours * (excessiveIdlePercentage / 100)
  const idleTimeCost = idleHours * hourlyRate
  
  // 6. Quality Rework - Additional time spent fixing defects
  const reworkHours = totalWorkingHours * (defectRate / 100)
  const reworkCost = reworkHours * hourlyRate * Math.max(0, reworkCostMultiplier - 1)
  
  // 7. Delay Penalties - Financial penalties for late delivery (if applicable)
  const expectedDelayDays = (projectDuration * workingDaysPerMonth) * (delayPercentage / 100)
  const delayPenaltyCost = expectedDelayDays * penaltyCostPerDay
  
  // 8. Opportunity Cost - Lost business value due to delays (if applicable)
  const opportunityCost = expectedDelayDays * opportunityCostPerDay
  
  // 9. Premium Resource Costs - Only if resourceCostPerHour is significantly higher
  const premiumDifference = Math.max(0, resourceCostPerHour - hourlyRate)
  const premiumResourceHours = premiumDifference > 10 ? totalWorkingHours * 0.1 : 0 // Only 10% if premium is significant
  const premiumResourceCost = premiumResourceHours * premiumDifference

  // Total waste breakdown
  const wasteBreakdown = {
    processInefficiencies: Math.round(processWasteCost),
    excessiveMeetings: Math.round(excessiveMeetingCost),
    communicationOverhead: Math.round(communicationWasteCost),
    resourceUnderutilization: Math.round(underutilizationCost),
    idleTime: Math.round(idleTimeCost),
    qualityRework: Math.round(reworkCost),
    delayPenalties: Math.round(delayPenaltyCost),
    opportunityCosts: Math.round(opportunityCost),
    premiumResourceCosts: Math.round(premiumResourceCost)
  }

  const totalWaste = Object.values(wasteBreakdown).reduce((sum, cost) => sum + cost, 0)
  const currentProjectCost = efficientLaborCost + totalWaste

  // Key metrics for sales conversation
  const metrics = {
    efficientProjectCost: Math.round(efficientLaborCost),
    currentProjectCost: Math.round(currentProjectCost),
    totalWaste: Math.round(totalWaste),
    wastePercentage: Math.round((totalWaste / currentProjectCost) * 100),
    monthlyWaste: Math.round(totalWaste / projectDuration),
    dailyWaste: Math.round(totalWaste / (projectDuration * workingDaysPerMonth)),
    wastePerResource: Math.round(totalWaste / teamSize),
    efficiencyRating: Math.max(0, Math.round((efficientLaborCost / currentProjectCost) * 100)),
    potentialSavings: Math.round(totalWaste * 0.7), // Assume 70% of waste can be eliminated
    monthlyBurnRate: Math.round(currentProjectCost / projectDuration),
    effectiveHourlyRate: Math.round(currentProjectCost / totalWorkingHours),
    
    // Annual organizational impact
    annualWaste: Math.round(totalWaste * projectsPerYear),
    annualPotentialSavings: Math.round(totalWaste * 0.7 * projectsPerYear),
    annualCurrentCost: Math.round(currentProjectCost * projectsPerYear),
    annualEfficientCost: Math.round(efficientLaborCost * projectsPerYear)
  }

  // Debug logging for your specific case
  console.log('=== REALISTIC CALCULATION DEBUG ===')
  console.log('Total Working Hours:', totalWorkingHours)
  console.log('Efficient Labor Cost:', efficientLaborCost)
  console.log('Process Waste Hours:', processWasteHours, 'Cost:', processWasteCost)
  console.log('Meeting Hours (total):', totalMeetingHours, 'Excessive (15%):', excessiveMeetingHours, 'Cost:', excessiveMeetingCost)
  console.log('Communication Waste Hours:', communicationWasteHours, 'Cost:', communicationWasteCost)
  console.log('Underutilization (only below 85%):', underutilizationPercentage + '%', 'Hours:', underutilizationHours, 'Cost:', underutilizationCost)
  console.log('Idle Time (only above 5%):', excessiveIdlePercentage + '%', 'Hours:', idleHours, 'Cost:', idleTimeCost)
  console.log('Rework Hours:', reworkHours, 'Cost:', reworkCost)
  console.log('Delay Days:', expectedDelayDays, 'Penalty Cost:', delayPenaltyCost, 'Opportunity Cost:', opportunityCost)
  console.log('Premium Resource Cost:', premiumResourceCost)
  console.log('Total Waste:', totalWaste)
  console.log('Waste Percentage:', Math.round((totalWaste / currentProjectCost) * 100) + '%')
  console.log('====================================')

  return {
    totalCost: Math.round(currentProjectCost),
    efficientCost: Math.round(efficientLaborCost),
    totalWaste: Math.round(totalWaste),
    wasteBreakdown,
    metrics,
    
    // Legacy compatibility for existing components
    baseProjectCost: Math.round(efficientLaborCost),
    totalInefficiencyCost: Math.round(totalWaste),
    inefficiencyBreakdown: wasteBreakdown,
    baseBreakdown: {
      baseLaborCost: Math.round(efficientLaborCost),
      baseManagementCost: 0,
      baseTechnologyCost: 0,
      baseQACost: 0,
      baseAdminCost: 0
    },
    breakdown: {
      projectManagementCosts: Math.round(processWasteCost + excessiveMeetingCost),
      communicationCosts: Math.round(communicationWasteCost),
      resourceManagementCosts: Math.round(underutilizationCost + idleTimeCost + premiumResourceCost),
      qualityCosts: Math.round(reworkCost),
      timelineCosts: Math.round(delayPenaltyCost + opportunityCost),
      technologyCosts: 0,
      riskContingency: 0,
      administrativeCosts: 0
    }
  }
}

// Calculate ROI scenarios for consulting engagement
export function calculateConsultingROI(totalWaste, consultingInputs, projectsPerYear = 4) {
  const consultingFee = consultingInputs?.consultingFee || 75000
  const supportCost = consultingInputs?.supportCost || 25000
  const totalInvestment = consultingFee + supportCost
  const expectedReduction = (consultingInputs?.expectedWasteReduction || 60) / 100
  
  const scenarios = [
    {
      name: 'Conservative Impact',
      wasteReduction: expectedReduction * 0.5, // 50% of expected
      description: `${Math.round(expectedReduction * 50)}% waste reduction - Basic improvements`
    },
    {
      name: 'Realistic Impact',
      wasteReduction: expectedReduction, // Use configured expectation
      description: `${Math.round(expectedReduction * 100)}% waste reduction - Full implementation`
    },
    {
      name: 'Optimistic Impact',
      wasteReduction: Math.min(0.9, expectedReduction * 1.5), // 150% of expected, capped at 90%
      description: `${Math.round(Math.min(90, expectedReduction * 150))}% waste reduction - Exceptional results`
    }
  ]

  return scenarios.map(scenario => {
    const annualWasteSavings = totalWaste * scenario.wasteReduction * projectsPerYear
    const netSavings = annualWasteSavings - totalInvestment
    const roi = Math.round((netSavings / totalInvestment) * 100)
    const paybackMonths = Math.ceil(totalInvestment / (annualWasteSavings / 12))

    return {
      ...scenario,
      annualSavings: Math.round(annualWasteSavings),
      netSavings: Math.round(netSavings),
      roi: `${roi}%`,
      paybackPeriod: `${paybackMonths} months`,
      consultingFee: Math.round(consultingFee),
      supportCost: Math.round(supportCost),
      totalInvestment: Math.round(totalInvestment)
    }
  })
}

// Get waste reduction recommendations prioritized by impact
export function getWasteReductionOpportunities(wasteBreakdown, totalWaste) {
  const opportunities = []

  // Sort waste by impact and only show significant ones
  const sortedWaste = Object.entries(wasteBreakdown)
    .filter(([, cost]) => cost > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // Top 5 waste sources

  sortedWaste.forEach(([category, cost]) => {
    const impactPercentage = Math.round((cost / totalWaste) * 100)
    const potentialSavings = Math.round(cost * 0.7) // 70% reduction potential

    switch (category) {
      case 'processInefficiencies':
        opportunities.push({
          category: 'Process Optimization',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Implement standardized workflows, eliminate redundant steps, introduce automation where possible',
          timeToImplement: '2-3 months',
          priority: impactPercentage > 25 ? 'High' : 'Medium'
        })
        break
      case 'excessiveMeetings':
        opportunities.push({
          category: 'Meeting Efficiency',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Reduce meeting frequency by 40%, implement async updates, establish clear meeting protocols',
          timeToImplement: '1 month',
          priority: impactPercentage > 20 ? 'High' : 'Medium'
        })
        break
      case 'communicationOverhead':
        opportunities.push({
          category: 'Communication Streamlining',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Deploy collaboration tools, create communication standards, implement status dashboards',
          timeToImplement: '1-2 months',
          priority: impactPercentage > 15 ? 'High' : 'Medium'
        })
        break
      case 'resourceUnderutilization':
        opportunities.push({
          category: 'Resource Optimization',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Implement capacity planning, cross-train team members, optimize task allocation',
          timeToImplement: '2-4 months',
          priority: impactPercentage > 20 ? 'High' : 'Medium'
        })
        break
      case 'idleTime':
        opportunities.push({
          category: 'Workflow Optimization',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Eliminate bottlenecks, implement parallel work streams, improve dependency management',
          timeToImplement: '1-3 months',
          priority: impactPercentage > 15 ? 'High' : 'Medium'
        })
        break
      case 'qualityRework':
        opportunities.push({
          category: 'Quality Management',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Implement quality gates, establish review processes, invest in upfront planning',
          timeToImplement: '2-3 months',
          priority: impactPercentage > 20 ? 'High' : 'Medium'
        })
        break
      case 'delayPenalties':
        opportunities.push({
          category: 'Timeline Management',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Improve project planning, implement milestone tracking, establish realistic timelines',
          timeToImplement: '1-2 months',
          priority: impactPercentage > 10 ? 'Medium' : 'Low'
        })
        break
      case 'opportunityCosts':
        opportunities.push({
          category: 'Strategic Planning',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Improve project prioritization, implement portfolio management, optimize resource allocation',
          timeToImplement: '3-6 months',
          priority: impactPercentage > 15 ? 'Medium' : 'Low'
        })
        break
      case 'premiumResourceCosts':
        opportunities.push({
          category: 'Resource Planning',
          currentWaste: cost,
          impactPercentage,
          potentialSavings,
          solution: 'Improve resource forecasting, establish preferred vendor relationships, optimize hiring',
          timeToImplement: '2-4 months',
          priority: impactPercentage > 10 ? 'Medium' : 'Low'
        })
        break
    }
  })

  return opportunities.filter(opp => opp.potentialSavings > 1000) // Only show meaningful opportunities
}

// Legacy functions for compatibility
export function calculateROIScenarios(totalCost, inputs) {
  const estimatedWaste = totalCost * 0.25 // Assume 25% waste
  return calculateConsultingROI(estimatedWaste, 75000)
}

export function getEfficiencyRecommendations(inefficiencyBreakdown, baseProjectCost) {
  const totalWaste = Object.values(inefficiencyBreakdown).reduce((sum, cost) => sum + cost, 0)
  return getWasteReductionOpportunities(inefficiencyBreakdown, totalWaste)
}