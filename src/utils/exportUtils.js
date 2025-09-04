import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx'
import pptxgen from 'pptxgenjs'
import { saveAs } from 'file-saver'

// Export to PDF
export const exportToPDF = async (elementId = 'results-content', filename = 'project-analysis-report.pdf') => {
  try {
    const element = document.getElementById(elementId) || document.querySelector('.results-container')
    
    if (!element) {
      throw new Error('Content element not found')
    }

    // Create canvas from HTML
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(filename)
    
    return { success: true, message: 'PDF exported successfully' }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, message: 'Failed to export PDF: ' + error.message }
  }
}

// Export to Word Document
export const exportToWord = async (data, filename = 'project-analysis-report.docx') => {
  try {
    const { clientInfo, calculations, costInputs, consultingInputs } = data

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Project Inefficiency Analysis Report",
                bold: true,
                size: 32,
                color: "1f2937"
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Client Information
          new Paragraph({
            children: [
              new TextRun({
                text: "Client Information",
                bold: true,
                size: 24,
                color: "374151"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Company: ", bold: true }),
              new TextRun({ text: clientInfo?.company || 'N/A' })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Contact: ", bold: true }),
              new TextRun({ text: clientInfo?.name || 'N/A' })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun({ text: clientInfo?.email || 'N/A' })
            ],
            spacing: { after: 200 }
          }),

          // Executive Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "Executive Summary",
                bold: true,
                size: 24,
                color: "374151"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Your organization is currently losing $${calculations?.metrics?.annualWaste?.toLocaleString() || '0'} annually across ${costInputs?.projectsPerYear || 0} similar projects. This represents ${calculations?.metrics?.wastePercentage || 0}% of your project budgets being wasted due to process inefficiencies.`,
                size: 22
              })
            ],
            spacing: { after: 200 }
          }),

          // Key Metrics Table
          new Paragraph({
            children: [
              new TextRun({
                text: "Key Financial Metrics",
                bold: true,
                size: 20,
                color: "374151"
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Metric", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Current Total Cost" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${calculations?.totalCost?.toLocaleString() || '0'}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Current Waste" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${calculations?.totalWaste?.toLocaleString() || '0'}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Efficient Project Cost" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${calculations?.efficientCost?.toLocaleString() || '0'}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Annual Waste" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${calculations?.metrics?.annualWaste?.toLocaleString() || '0'}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Annual Savings Potential" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${calculations?.metrics?.annualPotentialSavings?.toLocaleString() || '0'}` })] })] })
                ]
              })
            ]
          }),

          // Recommendations
          new Paragraph({
            children: [
              new TextRun({
                text: "Recommendations",
                bold: true,
                size: 20,
                color: "374151"
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Based on our analysis, we recommend implementing a comprehensive waste reduction program that could deliver 300-500% ROI in the first year. Our consulting services typically help clients recover 60-80% of identified waste within 3-6 months.",
                size: 22
              })
            ],
            spacing: { after: 200 }
          }),

          // Contact Information
          new Paragraph({
            children: [
              new TextRun({
                text: "Next Steps",
                bold: true,
                size: 20,
                color: "374151"
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Contact us to schedule a free consultation and discuss how we can help you eliminate these inefficiencies and recover the lost value in your projects.",
                size: 22
              })
            ],
            spacing: { after: 200 }
          })
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    saveAs(blob, filename)
    
    return { success: true, message: 'Word document exported successfully' }
  } catch (error) {
    console.error('Word export error:', error)
    return { success: false, message: 'Failed to export Word document: ' + error.message }
  }
}

// Export to PowerPoint
export const exportToPowerPoint = async (data, filename = 'project-analysis-presentation.pptx') => {
  try {
    const { clientInfo, calculations, costInputs, consultingInputs } = data
    const pptx = new pptxgen()

    // Set presentation properties
    pptx.author = 'Sales Cost Calculator'
    pptx.company = 'EPMA'
    pptx.title = 'Project Inefficiency Analysis'

    // Slide 1: Title Slide
    const slide1 = pptx.addSlide()
    slide1.addText('Project Inefficiency Analysis', {
      x: 1, y: 2, w: 8, h: 1.5,
      fontSize: 36, bold: true, color: '1f2937', align: 'center'
    })
    slide1.addText(`${clientInfo?.company || 'Client Company'}`, {
      x: 1, y: 3.5, w: 8, h: 1,
      fontSize: 24, color: '374151', align: 'center'
    })
    slide1.addText(new Date().toLocaleDateString(), {
      x: 1, y: 6, w: 8, h: 0.5,
      fontSize: 16, color: '6b7280', align: 'center'
    })

    // Slide 2: Executive Summary
    const slide2 = pptx.addSlide()
    slide2.addText('Executive Summary', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })
    slide2.addText('Your Organization is Losing Serious Money', {
      x: 0.5, y: 1.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: 'dc2626'
    })
    
    const summaryData = [
      ['Annual Waste', `$${calculations?.metrics?.annualWaste?.toLocaleString() || '0'}`],
      ['Monthly Waste', `$${Math.round((calculations?.metrics?.annualWaste || 0) / 12).toLocaleString()}`],
      ['Waste Percentage', `${calculations?.metrics?.wastePercentage || 0}%`],
      ['Annual Savings Potential', `$${calculations?.metrics?.annualPotentialSavings?.toLocaleString() || '0'}`]
    ]

    slide2.addTable(summaryData, {
      x: 1, y: 2.5, w: 8, h: 3,
      fontSize: 18,
      fill: { color: 'f3f4f6' },
      border: { pt: 1, color: 'd1d5db' }
    })

    // Slide 3: Current vs Efficient Costs
    const slide3 = pptx.addSlide()
    slide3.addText('Cost Reality Check', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })

    const costData = [
      ['Cost Type', 'Amount', 'Percentage'],
      ['Efficient Project Cost', `$${calculations?.efficientCost?.toLocaleString() || '0'}`, `${Math.round(((calculations?.efficientCost || 0) / (calculations?.totalCost || 1)) * 100)}%`],
      ['Current Waste', `$${calculations?.totalWaste?.toLocaleString() || '0'}`, `${calculations?.metrics?.wastePercentage || 0}%`],
      ['Current Total Cost', `$${calculations?.totalCost?.toLocaleString() || '0'}`, '100%']
    ]

    slide3.addTable(costData, {
      x: 1, y: 1.5, w: 8, h: 3,
      fontSize: 16,
      fill: { color: 'f9fafb' },
      border: { pt: 1, color: 'd1d5db' }
    })

    // Slide 4: ROI Scenarios
    const slide4 = pptx.addSlide()
    slide4.addText('ROI of Our Consulting Services', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 28, bold: true, color: '1f2937'
    })

    const totalInvestment = (consultingInputs?.consultingFee || 75000) + (consultingInputs?.supportCost || 25000)
    const annualWaste = (calculations?.totalWaste || 0) * (costInputs?.projectsPerYear || 4)
    
    const roiData = [
      ['Scenario', 'Waste Reduction', 'Annual Savings', 'ROI'],
      ['Conservative', '30%', `$${Math.round(annualWaste * 0.3).toLocaleString()}`, `${Math.round(((annualWaste * 0.3 - totalInvestment) / totalInvestment) * 100)}%`],
      ['Realistic', '60%', `$${Math.round(annualWaste * 0.6).toLocaleString()}`, `${Math.round(((annualWaste * 0.6 - totalInvestment) / totalInvestment) * 100)}%`],
      ['Optimistic', '80%', `$${Math.round(annualWaste * 0.8).toLocaleString()}`, `${Math.round(((annualWaste * 0.8 - totalInvestment) / totalInvestment) * 100)}%`]
    ]

    slide4.addTable(roiData, {
      x: 0.5, y: 1.5, w: 9, h: 3,
      fontSize: 16,
      fill: { color: 'f0f9ff' },
      border: { pt: 1, color: '0ea5e9' }
    })

    // Slide 5: Next Steps
    const slide5 = pptx.addSlide()
    slide5.addText('Ready to Stop Wasting Money?', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })

    const nextStepsText = [
      '• Schedule a free consultation to discuss your specific needs',
      '• Implement proven waste reduction strategies',
      '• Achieve 300-500% ROI within the first year',
      '• Recover 60-80% of identified waste within 3-6 months'
    ]

    slide5.addText(nextStepsText.join('\n'), {
      x: 1, y: 2, w: 8, h: 4,
      fontSize: 20, color: '374151', lineSpacing: 36
    })

    // Generate and save the presentation
    const buffer = await pptx.write('arraybuffer')
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    saveAs(blob, filename)
    
    return { success: true, message: 'PowerPoint presentation exported successfully' }
  } catch (error) {
    console.error('PowerPoint export error:', error)
    return { success: false, message: 'Failed to export PowerPoint: ' + error.message }
  }
}

// Export all formats
export const exportAll = async (data) => {
  try {
    const results = await Promise.allSettled([
      exportToPDF('results-content'),
      exportToWord(data),
      exportToPowerPoint(data)
    ])

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return {
      success: successful > 0,
      message: `Exported ${successful} files successfully${failed > 0 ? `, ${failed} failed` : ''}`
    }
  } catch (error) {
    console.error('Export all error:', error)
    return { success: false, message: 'Failed to export files: ' + error.message }
  }
}