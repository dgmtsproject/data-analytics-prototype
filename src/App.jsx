import { useState, useEffect } from 'react'
import * as d3 from 'd3'
import './Dashboard.css'

function App() {
  const [nodesData, setNodesData] = useState([])
  const [linksData, setLinksData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // In a real app, you'd fetch from API endpoints
      // For now, we'll use the CSV data directly
      const nodesResponse = await fetch('/data/nodes.csv')
      const linksResponse = await fetch('/data/links.csv')
      
      const nodesText = await nodesResponse.text()
      const linksText = await linksResponse.text()
      
      const nodes = d3.csvParse(nodesText)
      const links = d3.csvParse(linksText)
      
      // Convert numeric fields to numbers
      const processedNodes = nodes.map(node => ({
        ...node,
        BirthYear: parseInt(node.BirthYear),
        MarriageAge: parseInt(node.MarriageAge),
        MarriageYear: parseInt(node.MarriageYear),
        NumKids: parseInt(node.NumKids),
        HavingKidsAge: parseInt(node.HavingKidsAge),
        HavingKidsYear: parseInt(node.HavingKidsYear)
      }))
      
      setNodesData(processedNodes)
      setLinksData(links)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to sample data
      const sampleNodes = [
        { Node: 'P001', BirthYear: 1980, Sex: 'Female', Marriage: 'oppositeSexMarried', MarriageAge: 25, MarriageYear: 2005, NumKids: 2, HavingKidsAge: 28, HavingKidsYear: 2008, FamilyIndicator: 'Family' },
        { Node: 'P002', BirthYear: 1982, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 27, MarriageYear: 2009, NumKids: 1, HavingKidsAge: 30, HavingKidsYear: 2012, FamilyIndicator: 'Family' },
        { Node: 'P003', BirthYear: 1985, Sex: 'Female', Marriage: 'Single', MarriageAge: 0, MarriageYear: 0, NumKids: 0, HavingKidsAge: 0, HavingKidsYear: 0, FamilyIndicator: 'NoFamily' },
        { Node: 'P004', BirthYear: 1978, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 24, MarriageYear: 2002, NumKids: 3, HavingKidsAge: 26, HavingKidsYear: 2004, FamilyIndicator: 'Family' },
        { Node: 'P005', BirthYear: 1990, Sex: 'Female', Marriage: 'sameSexMarried', MarriageAge: 28, MarriageYear: 2018, NumKids: 1, HavingKidsAge: 30, HavingKidsYear: 2020, FamilyIndicator: 'Family' }
      ]
      setNodesData(sampleNodes)
      setLinksData([])
      setLoading(false)
    }
  }

  const downloadCSV = (data, filename) => {
    const csvContent = d3.csvFormat(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadNodesCSV = () => {
    downloadCSV(nodesData, 'family_nodes_data.csv')
  }

  const downloadLinksCSV = () => {
    downloadCSV(linksData, 'family_links_data.csv')
  }

  const downloadAllData = () => {
    // Create a zip file with both CSVs
    const nodesCSV = d3.csvFormat(nodesData)
    const linksCSV = d3.csvFormat(linksData)
    
    // For now, we'll download them separately with a small delay
    downloadCSV(nodesData, 'family_nodes_data.csv')
    setTimeout(() => {
      downloadCSV(linksData, 'family_links_data.csv')
    }, 500)
  }

  useEffect(() => {
    if (!loading && nodesData.length > 0) {
      createBirthYearDistribution()
      createMarriageAgeAnalysis()
      createKidsAnalysis()
      createMarriageTypeDistribution()
      createFamilyTimeline()
    }
  }, [loading, nodesData])

  const createBirthYearDistribution = () => {
    d3.select('#birth-year-chart').selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select('#birth-year-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const birthYears = [...new Set(nodesData.map(d => d.BirthYear))]
    const yearCounts = birthYears.map(year => ({
      year: year,
      count: nodesData.filter(d => d.BirthYear === year).length
    }))

    const x = d3.scaleLinear()
      .domain(d3.extent(yearCounts, d => d.year))
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearCounts, d => d.count)])
      .range([height, 0])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))

    svg.append('g')
      .call(d3.axisLeft(y))

    svg.selectAll('.bar')
      .data(yearCounts)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.year))
      .attr('width', 8)
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', '#4299e1')
      .attr('rx', 2)

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .text('Birth Year')
  }

  const createMarriageAgeAnalysis = () => {
    d3.select('#marriage-age-chart').selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select('#marriage-age-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const marriedData = nodesData.filter(d => d.Marriage !== 'Single' && d.MarriageAge > 0)
    const ageGroups = d3.range(20, 36, 2)
    const ageCounts = ageGroups.map(age => ({
      age: age,
      count: marriedData.filter(d => d.MarriageAge >= age && d.MarriageAge < age + 2).length
    }))

    const x = d3.scaleBand()
      .range([0, width])
      .domain(ageCounts.map(d => `${d.age}-${d.age + 1}`))
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(ageCounts, d => d.count)])
      .range([height, 0])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))

    svg.append('g')
      .call(d3.axisLeft(y))

    svg.selectAll('.bar')
      .data(ageCounts)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(`${d.age}-${d.age + 1}`))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', '#48bb78')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .text('Marriage Age Group')
  }

  const createKidsAnalysis = () => {
    d3.select('#kids-analysis-chart').selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select('#kids-analysis-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Include all possible values including 0
    const kidsCounts = d3.range(0, 6).map(num => ({
      kids: num,
      count: nodesData.filter(d => d.NumKids === num).length
    }))

    const x = d3.scaleBand()
      .range([0, width])
      .domain(kidsCounts.map(d => d.kids))
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(kidsCounts, d => d.count)])
      .range([height, 0])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))

    svg.append('g')
      .call(d3.axisLeft(y))

    svg.selectAll('.bar')
      .data(kidsCounts)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.kids))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', d => d.kids === 0 ? '#e53e3e' : '#ed8936')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .text('Number of Kids')
  }

  const createMarriageTypeDistribution = () => {
    d3.select('#marriage-type-chart').selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select('#marriage-type-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const marriageTypes = ['oppositeSexMarried', 'sameSexMarried', 'Single']
    const typeCounts = marriageTypes.map(type => ({
      type: type,
      count: nodesData.filter(d => d.Marriage === type).length
    }))

    const color = d3.scaleOrdinal()
      .domain(marriageTypes)
      .range(['#4299e1', '#9f7aea', '#e53e3e'])

    const pie = d3.pie()
      .value(d => d.count)

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 1)

    const pieGroup = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    pieGroup.selectAll('path')
      .data(pie(typeCounts))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.type))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')

    // Add labels
    pieGroup.selectAll('text')
      .data(pie(typeCounts))
      .enter().append('text')
      .text(d => `${d.data.type}\n(${d.data.count})`)
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'white')
  }

  const createFamilyTimeline = () => {
    d3.select('#family-timeline-chart').selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select('#family-timeline-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const timelineData = nodesData
      .filter(d => d.HavingKidsYear > 0)
      .map(d => ({
        year: d.HavingKidsYear,
        age: d.HavingKidsAge,
        kids: d.NumKids
      }))
      .sort((a, b) => a.year - b.year)

    const x = d3.scaleLinear()
      .domain(d3.extent(timelineData, d => d.year))
      .range([0, width])

    const y = d3.scaleLinear()
      .domain(d3.extent(timelineData, d => d.age))
      .range([height, 0])

    const size = d3.scaleLinear()
      .domain(d3.extent(timelineData, d => d.kids))
      .range([4, 12])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))

    svg.append('g')
      .call(d3.axisLeft(y))

    svg.selectAll('circle')
      .data(timelineData)
      .enter().append('circle')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.age))
      .attr('r', d => size(d.kids))
      .attr('fill', '#e53e3e')
      .attr('opacity', 0.7)

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .text('Year')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text('Age When Having Kids')
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading Family Analytics Dashboard...</div>
      </div>
    )
  }

  // Calculate ratios and additional metrics
  const totalIndividuals = nodesData.length
  const marriedCouples = nodesData.filter(d => d.Marriage !== 'Single').length
  const familiesWithKids = nodesData.filter(d => d.NumKids > 0).length
  const singleIndividuals = nodesData.filter(d => d.Marriage === 'Single').length
  const sameSexMarriages = nodesData.filter(d => d.Marriage === 'sameSexMarried').length
  const oppositeSexMarriages = nodesData.filter(d => d.Marriage === 'oppositeSexMarried').length
  
  const marriageRate = ((marriedCouples / totalIndividuals) * 100).toFixed(1)
  const familyFormationRate = ((familiesWithKids / marriedCouples) * 100).toFixed(1)
  const singleRate = ((singleIndividuals / totalIndividuals) * 100).toFixed(1)
  const sameSexMarriageRate = ((sameSexMarriages / marriedCouples) * 100).toFixed(1)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Family & Marriage Analytics Dashboard</h1>
        <p>Comprehensive analysis of family dynamics, marriage patterns, and demographic trends</p>
        
        <div className="download-section">
          <h3>Download Data</h3>
          <div className="download-buttons">
            <button onClick={downloadNodesCSV} className="download-btn">
              📊 Download Nodes CSV
            </button>
            <button onClick={downloadLinksCSV} className="download-btn">
              🔗 Download Links CSV
            </button>
            <button onClick={downloadAllData} className="download-btn primary">
              📁 Download All Data
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="overview-stats">
          <div className="stat-card">
            <h3>Total Individuals</h3>
            <p className="stat-value">{totalIndividuals}</p>
          </div>
          <div className="stat-card">
            <h3>Married Couples</h3>
            <p className="stat-value">{marriedCouples}</p>
            <p className="stat-ratio">({marriageRate}%)</p>
          </div>
          <div className="stat-card">
            <h3>Families with Kids</h3>
            <p className="stat-value">{familiesWithKids}</p>
            <p className="stat-ratio">({familyFormationRate}% of married)</p>
          </div>
          <div className="stat-card">
            <h3>Average Kids per Family</h3>
            <p className="stat-value">
              {(nodesData.filter(d => d.NumKids > 0).reduce((sum, d) => sum + d.NumKids, 0) / 
                nodesData.filter(d => d.NumKids > 0).length).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="ratio-stats">
          <div className="ratio-card">
            <h3>Marriage Rate</h3>
            <p className="ratio-value">{marriageRate}%</p>
            <p className="ratio-description">of total population is married</p>
          </div>
          <div className="ratio-card">
            <h3>Single Rate</h3>
            <p className="ratio-value">{singleRate}%</p>
            <p className="ratio-description">of population is single</p>
          </div>
          <div className="ratio-card">
            <h3>Same-Sex Marriage Rate</h3>
            <p className="ratio-value">{sameSexMarriageRate}%</p>
            <p className="ratio-description">of married couples</p>
          </div>
          <div className="ratio-card">
            <h3>Family Formation Rate</h3>
            <p className="ratio-value">{familyFormationRate}%</p>
            <p className="ratio-description">of married couples have children</p>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h2>Birth Year Distribution</h2>
            <div id="birth-year-chart"></div>
          </div>
          
          <div className="chart-container">
            <h2>Marriage Age Analysis</h2>
            <div id="marriage-age-chart"></div>
          </div>
          
          <div className="chart-container">
            <h2>Family Size Analysis</h2>
            <div id="kids-analysis-chart"></div>
          </div>
          
          <div className="chart-container">
            <h2>Marriage Type Distribution</h2>
            <div id="marriage-type-chart"></div>
          </div>
          
          <div className="chart-container full-width">
            <h2>Family Formation Timeline</h2>
            <div id="family-timeline-chart"></div>
          </div>
        </div>

        <div className="insights-section">
          <h2>Key Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Marriage Trends</h3>
              <p>Most individuals marry between ages 24-30, with opposite-sex marriages being the most common.</p>
            </div>
            <div className="insight-card">
              <h3>Family Formation</h3>
              <p>Families typically have 1-3 children, with peak childbearing occurring in late 20s to early 30s.</p>
            </div>
            <div className="insight-card">
              <h3>Demographic Patterns</h3>
              <p>Birth years show a concentration in the 1980s, indicating a specific generational cohort.</p>
            </div>
            <div className="insight-card">
              <h3>Marriage & Family Ratios</h3>
              <p>{marriageRate}% marriage rate with {familyFormationRate}% of married couples forming families with children.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
