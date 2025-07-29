# Sales Cost Calculator

A comprehensive React-based application for calculating project costs and identifying inefficiencies in sales processes. This tool helps sales teams and consultants analyze project waste, calculate ROI, and generate professional reports for clients.

## Features

### 🎯 Core Functionality
- **Client Management**: Store and manage multiple client projects
- **Cost Analysis**: Comprehensive project cost calculations with waste identification
- **ROI Projections**: Calculate consulting engagement ROI scenarios
- **Professional Reports**: Generate detailed analysis reports with charts and visualizations

### 📊 Analysis Capabilities
- **Waste Identification**: Identify 9 key areas of project waste
- **Efficiency Scoring**: Calculate project efficiency ratings
- **Annual Impact**: Scale analysis to organizational level
- **Risk Assessment**: Evaluate timeline, quality, and resource risks

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Calculations**: Live updates as you adjust parameters
- **Professional Charts**: Interactive visualizations using Recharts
- **Export Ready**: Prepare reports for client presentations

## Technology Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sales-cost-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx      # Main application layout
├── context/            # React Context for state management
│   └── AppContext.jsx  # Global application state
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Overview and navigation
│   ├── ClientsList.jsx # Client management
│   ├── ClientInfo.jsx  # Client information form
│   ├── CostInputs.jsx  # Cost parameter configuration
│   ├── ConsultingInputs.jsx # Consulting engagement setup
│   └── Results.jsx     # Analysis results and reports
├── utils/              # Utility functions
│   └── calculations.js # Cost calculation algorithms
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Usage Guide

### 1. Client Information
- Enter client contact details
- Capture project requirements and problem statement
- Information is automatically saved for future reference

### 2. Cost Parameters
Configure project parameters across 5 key areas:
- **Project Fundamentals**: Duration, team size, rates
- **Communication & Collaboration**: Meeting overhead, communication costs
- **Resource Management**: Utilization rates, idle time
- **Quality & Risk**: Defect rates, delay penalties
- **Organizational Scale**: Annual project volume

### 3. Consulting Setup
- Define consulting engagement parameters
- Set expected waste reduction targets
- Calculate ROI scenarios (Conservative, Realistic, Optimistic)

### 4. Results Analysis
Comprehensive reports including:
- Executive summary with key metrics
- Waste breakdown analysis
- ROI projections for consulting services
- Risk assessment
- Actionable recommendations

## Key Calculations

### Waste Categories
1. **Process Inefficiencies**: Time lost to poor processes
2. **Excessive Meetings**: Unproductive meeting time
3. **Communication Overhead**: Inefficient communication
4. **Resource Underutilization**: Idle team capacity
5. **Quality Rework**: Time spent fixing defects
6. **Delay Penalties**: Financial penalties for late delivery
7. **Opportunity Costs**: Lost business value from delays
8. **Premium Resource Costs**: Above-market resource rates

### ROI Calculation
```
Annual Savings = (Total Waste × Waste Reduction %) × Projects Per Year
Net Savings = Annual Savings - Total Investment
ROI = (Net Savings / Total Investment) × 100
```

## Customization

### Styling
The application uses Tailwind CSS with a custom design system. Key customizations:
- Color palette optimized for professional presentations
- Typography scale using Inter font family
- Component classes for consistent styling
- Responsive breakpoints for all screen sizes

### Calculations
Modify calculation logic in `src/utils/calculations.js`:
- Adjust waste calculation formulas
- Update ROI scenarios
- Customize recommendation algorithms

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ for sales teams and consultants who want to deliver data-driven value to their clients.