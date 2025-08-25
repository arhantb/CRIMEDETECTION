# Crime Analytics Dashboard - Timeline Predictions

A comprehensive crime analytics dashboard with advanced timeline prediction capabilities, built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Main Dashboard
- **Geographical Crime Heat Maps**: Interactive maps showing crime intensity across regions
- **Advanced Filtering**: Filter by crime types, time ranges, regions, and intensity
- **Socio-Economic Insights**: Economic overlay controls and analysis
- **Satellite Data Integration**: Satellite overlay controls and data analysis
- **AI-Powered Insights**: AI hologram panels and assistant functionality

### Timeline Predictions Dashboard (NEW)
- **CSV Data Import**: Upload places.csv files with crime data
- **Timeline Analysis**: Analyze crime patterns over time by area and dates
- **Predictive Intelligence**: AI-powered crime predictions for upcoming months
- **Seasonal Pattern Recognition**: Identify peak and low crime seasons
- **District Hotspot Analysis**: Visualize high-risk areas with interactive heat maps
- **Trend Analysis**: Track crime trends with percentage changes and visualizations

## CSV Data Format

The Timeline Predictions dashboard expects CSV files with the following columns:

```csv
Latitude,Longitude,CrimeGroup_Name,Year,Month,District_Name
28.6139,77.2090,Theft,2023,1,New Delhi
19.0760,72.8777,Assault,2023,2,Mumbai
12.9716,77.5946,Fraud,2023,3,Bangalore
```

### Required Columns:
- **Latitude**: Geographic latitude coordinate
- **Longitude**: Geographic longitude coordinate  
- **CrimeGroup_Name**: Type of crime (e.g., Theft, Assault, Fraud, Cybercrime, DrugOffenses)
- **Year**: Year of the crime incident
- **Month**: Month of the crime incident (1-12)
- **District_Name**: Name of the district where the crime occurred

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CriminalPrediction
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Main Dashboard
1. Navigate to the main dashboard at `/`
2. Use the advanced filter panel to customize your analysis
3. Explore the crime heat map and socio-economic insights
4. Utilize AI-powered features for enhanced analysis

### Timeline Predictions Dashboard
1. Navigate to `/timeline-predictions`
2. Upload your places.csv file using the file upload interface
3. View data quality metrics and statistics
4. Apply filters to focus on specific districts, crime types, or time periods
5. Explore the analysis results across four main tabs:
   - **Overview**: Summary of crime trends and next month predictions
   - **Trends**: Detailed crime trend analysis with visualizations
   - **Hotspots**: District hotspot analysis with risk level indicators
   - **Predictions**: Prediction accuracy and analysis summary

## Dashboard Features

### Data Quality Assessment
- Total records count
- Districts covered
- Crime types identified
- Data quality percentage

### Analysis Capabilities
- **Crime Trend Analysis**: Track percentage changes and identify increasing/decreasing trends
- **Seasonal Pattern Recognition**: Identify peak, low, and average crime seasons
- **District Hotspot Mapping**: Visualize high-risk areas with crime intensity indicators
- **Predictive Modeling**: AI-powered predictions for upcoming months with confidence levels

### Interactive Visualizations
- **Timeline Trend Charts**: Bar charts showing crime patterns over time
- **Seasonal Pattern Charts**: Monthly crime distribution with trend indicators
- **District Heat Maps**: Interactive cards showing crime hotspots with risk levels
- **Prediction Accuracy Metrics**: Historical accuracy tracking and confidence intervals

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Custom chart components with CSS animations
- **Authentication**: Clerk
- **Data Processing**: Custom TypeScript services
- **Animations**: CSS animations and transitions

## Project Structure

```
CriminalPrediction/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── timeline-predictions/
│       └── page.tsx
├── components/
│   ├── navigation.tsx
│   ├── timeline-predictions-dashboard.tsx
│   ├── timeline-trend-chart.tsx
│   ├── timeline-heat-map.tsx
│   ├── timeline-seasonal-chart.tsx
│   └── ui/ (shadcn/ui components)
├── lib/
│   ├── services/
│   │   ├── crime-data-service.ts
│   │   └── timeline-data-service.ts
│   └── types/
│       ├── crime-data.ts
│       └── timeline-data.ts
└── public/
    └── sample-places.csv
```

## Sample Data

A sample CSV file (`sample-places.csv`) is included in the `public` directory for testing the Timeline Predictions dashboard. This file contains sample crime data across multiple cities and time periods.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.


