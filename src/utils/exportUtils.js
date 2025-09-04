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
export const exportToWord = async (elementId = 'results-content', filename = 'project-analysis-report.docx') => {
  try {
    const element = document.getElementById(elementId) || document.querySelector('.results-container')
    
    if (!element) {
      throw new Error('Content element not found')
    }

    // Create canvas from HTML to get image
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    
    // Extract key text content for Word document
    const textContent = element.innerText || element.textContent || ''
    const lines = textContent.split('\n').filter(line => line.trim().length > 0)
    
    // Create paragraphs from the extracted text
    const paragraphs = []
    
    // Add title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Project Analysis Report - Complete Details",
            bold: true,
            size: 32,
            color: "1f2937"
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )
    
    // Add the full report as an image
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Complete Visual Report",
            bold: true,
            size: 24,
            color: "374151"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    )
    
    // Add note about the image
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "The complete analysis report is shown below as a high-resolution image. All charts, metrics, waste breakdowns, ROI scenarios, and recommendations are included.",
            size: 20
          })
        ],
        spacing: { after: 200 }
      })
    )
    
    // Add extracted text content in sections
    let currentSection = ""
    for (const line of lines) {
      if (line.length > 0) {
        // Check if this looks like a heading (short line, likely a title)
        if (line.length < 100 && (
          line.includes('Analysis') || 
          line.includes('Summary') || 
          line.includes('Metrics') || 
          line.includes('ROI') || 
          line.includes('Waste') ||
          line.includes('Opportunities') ||
          line.includes('Risk') ||
          line.includes('$') && line.length < 50
        )) {
          // Add as heading
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  bold: true,
                  size: 22,
                  color: "374151"
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 }
            })
          )
        } else {
          // Add as regular paragraph
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 18
                })
              ],
              spacing: { after: 100 }
            })
          )
        }
      }
    }
    
    // Add instructions
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "How to Use This Document",
            bold: true,
            size: 24,
            color: "374151"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 }
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "• This document contains your complete project analysis with all details extracted as text\n• The visual report image shows all charts and formatting\n• You can edit this document, add your branding, and customize the content\n• All financial metrics, waste analysis, and recommendations are included\n• Use this as a foundation for your client presentations and reports",
            size: 18
          })
        ],
        spacing: { after: 200 }
      })
    )

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, filename)
    
    return { success: true, message: 'Word document exported successfully' }
  } catch (error) {
    console.error('Word export error:', error)
    return { success: false, message: 'Failed to export Word document: ' + error.message }
  }
}

// Export to PowerPoint
export const exportToPowerPoint = async (elementId = 'results-content', filename = 'project-analysis-presentation.pptx') => {
  try {
    const element = document.getElementById(elementId) || document.querySelector('.results-container')
    
    if (!element) {
      throw new Error('Content element not found')
    }

    // Create canvas from HTML to get images for slides
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    
    const pptx = new pptxgen()

    // Set presentation properties
    pptx.author = 'Sales Cost Calculator'
    pptx.company = 'EPMA'
    pptx.title = 'Project Analysis Report - Complete'

    // Slide 1: Title
    const slide1 = pptx.addSlide()
    slide1.addText('Complete Project Analysis Report', {
      x: 1, y: 2, w: 8, h: 1.5,
      fontSize: 36, bold: true, color: '1f2937', align: 'center'
    })
    slide1.addText('Full Details & Analysis', {
      x: 1, y: 3.5, w: 8, h: 1,
      fontSize: 24, color: '374151', align: 'center'
    })
    slide1.addText(new Date().toLocaleDateString(), {
      x: 1, y: 6, w: 8, h: 0.5,
      fontSize: 16, color: '6b7280', align: 'center'
    })

    // Slide 2: Full Report Image (Part 1)
    const slide2 = pptx.addSlide()
    slide2.addText('Complete Analysis Report', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })
    
    // Add the full report as an image
    slide2.addImage({
      data: imgData,
      x: 0.2, y: 1.2, w: 9.6, h: 6.3,
      sizing: { type: 'contain', w: 9.6, h: 6.3 }
    })
    
    slide2.addText('Note: This slide contains the complete visual report. You can edit this presentation and add additional slides as needed.', {
      x: 0.5, y: 7.8, w: 9, h: 0.4,
      fontSize: 12, color: '6b7280', align: 'center', italic: true
    })

    // Slide 3: Instructions
    const slide3 = pptx.addSlide()
    slide3.addText('How to Use This Presentation', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })

    const instructions = [
      '• The previous slide contains your complete analysis report',
      '• You can add more slides, edit content, and customize the presentation',
      '• All charts, metrics, and recommendations are included in the image',
      '• Use this as a starting point for your client presentations',
      '• Add your company branding and additional context as needed'
    ]

    slide3.addText(instructions.join('\n'), {
      x: 1, y: 2, w: 8, h: 4,
      fontSize: 18, color: '374151', lineSpacing: 32
    })

    // Slide 4: Next Steps
    const slide4 = pptx.addSlide()
    slide4.addText('Ready to Take Action?', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, bold: true, color: '1f2937'
    })

    const nextStepsText = [
      '• Schedule a free consultation to discuss your specific needs',
      '• Review the complete analysis in the previous slides',
      '• Customize this presentation for your stakeholders',
      '• Contact us to implement waste reduction strategies'
    ]

    slide4.addText(nextStepsText.join('\n'), {
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
export const exportAll = async (elementId = 'results-content') => {
  try {
    const results = await Promise.allSettled([
      exportToPDF(elementId),
      exportToWord(elementId),
      exportToPowerPoint(elementId)
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