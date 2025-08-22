# Family & Marriage Analytics Dashboard

A comprehensive data analytics dashboard built with React and D3.js for analyzing family dynamics, marriage patterns, and demographic trends.

## 🚀 Features

### 📊 **5 Core Analytics Visualizations**

1. **Birth Year Distribution** - Bar chart showing demographic distribution by birth year
2. **Marriage Age Analysis** - Age group analysis for marriage patterns
3. **Family Size Analysis** - Distribution of number of children per family
4. **Marriage Type Distribution** - Pie chart of marriage types (opposite-sex, same-sex, single)
5. **Family Formation Timeline** - Scatter plot showing age vs. year when having kids

### 📈 **Key Metrics Dashboard**
- Total individuals in dataset
- Married couples count with marriage rate
- Families with children and family formation rate
- Average children per family

### 💡 **Ratio Analysis**
- Marriage rate percentage
- Single rate percentage
- Same-sex marriage rate
- Family formation rate

### 📥 **Data Export**
- Download individual nodes data as CSV
- Download relationship links data as CSV
- Download all data at once

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Data Visualization**: D3.js 7.9.0
- **Styling**: Modern CSS with glassmorphism effects
- **Data Format**: CSV with automatic download functionality

## 📁 Project Structure

```
data-analytics-prototype/
├── data/
│   ├── nodes.csv          # Individual person data
│   └── links.csv          # Relationship links data
├── src/
│   ├── App.jsx            # Main dashboard component
│   ├── Dashboard.css      # Dashboard styling
│   └── main.jsx          # App entry point
├── package.json
└── README.md
```

## 📊 Data Schema

### Nodes (Individuals)
- **Node**: Unique identifier
- **BirthYear**: Year of birth
- **Sex**: Female/Male
- **Marriage**: sameSexMarried/oppositeSexMarried/Single
- **MarriageAge**: Age at marriage
- **MarriageYear**: Year of marriage
- **NumKids**: Number of children
- **HavingKidsAge**: Age when having first child
- **HavingKidsYear**: Year when having first child
- **FamilyIndicator**: Family/NoFamily

### Links (Relationships)
- **Link**: Unique link identifier
- **Types**: Marriage link/Parent link
- **Source**: Source node
- **Target**: Target node
- **MarriageYear**: Year of marriage
- **NumKids**: Number of children
- **LinkStrength**: Strong/Fluid

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser** at `http://localhost:5173`

## 📈 Sample Data

The dashboard includes 50 sample individuals with realistic family and marriage data covering:
- Birth years: 1978-1990
- Marriage ages: 23-30
- Family sizes: 0-4 children
- Marriage types: Opposite-sex, same-sex, and single

## 🎨 Customization

### Adding New Charts
1. Create new chart function in `App.jsx`
2. Add chart container to JSX
3. Update CSS for new chart styling

### Data Integration
- Replace CSV files with API endpoints
- Modify `loadData()` function for data fetching
- Update data processing logic as needed

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Insights

The dashboard reveals patterns such as:
- **Marriage Age**: Peak marriage age is 24-30 years
- **Family Formation**: Most families have 1-3 children
- **Timing**: Peak childbearing occurs in late 20s to early 30s
- **Demographics**: Concentration in 1980s birth cohort
- **Ratios**: Marriage rates and family formation percentages
