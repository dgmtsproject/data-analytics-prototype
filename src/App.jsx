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
      const nodesResponse = await fetch('./nodes.csv')
      const linksResponse = await fetch('./links.csv')
      
      if (!nodesResponse.ok || !linksResponse.ok) {
        throw new Error(`Failed to fetch data: nodes=${nodesResponse.status}, links=${linksResponse.status}`)
      }
      
      const nodesText = await nodesResponse.text()
      const linksText = await linksResponse.text()
      
      const nodes = d3.csvParse(nodesText)
      const links = d3.csvParse(linksText)
      
      console.log('Loaded nodes:', nodes.length)
      console.log('Loaded links:', links.length)
      console.log('Sample nodes:', nodes.slice(0, 3))
      console.log('Sample links:', links.slice(0, 3))
      
      // Convert numeric fields to numbers
      const processedNodes = nodes.map(node => ({
        ...node,
        BirthYear: parseInt(node.BirthYear) || 0,
        MarriageAge: parseInt(node.MarriageAge) || 0,
        MarriageYear: parseInt(node.MarriageYear) || 0,
        NumKids: parseInt(node.NumKids) || 0,
        HavingKidsAge: parseInt(node.HavingKidsAge) || 0,
        HavingKidsYear: parseInt(node.HavingKidsYear) || 0
      }))
      
      setNodesData(processedNodes)
      setLinksData(links)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to sample data
      const sampleNodes = [
        { Node: 'P001', Name: 'John Smith', BirthYear: 1950, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 25, MarriageYear: 1975, NumKids: 3, HavingKidsAge: 28, HavingKidsYear: 1978, FamilyIndicator: 'Family' },
        { Node: 'P002', Name: 'Mary Johnson', BirthYear: 1952, Sex: 'Female', Marriage: 'oppositeSexMarried', MarriageAge: 23, MarriageYear: 1975, NumKids: 3, HavingKidsAge: 26, HavingKidsYear: 1978, FamilyIndicator: 'Family' },
        { Node: 'P003', Name: 'Michael Smith', BirthYear: 1978, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 26, MarriageYear: 2004, NumKids: 2, HavingKidsAge: 29, HavingKidsYear: 2007, FamilyIndicator: 'Family' },
        { Node: 'P004', Name: 'Sarah Williams', BirthYear: 1980, Sex: 'Female', Marriage: 'oppositeSexMarried', MarriageAge: 24, MarriageYear: 2004, NumKids: 2, HavingKidsAge: 27, HavingKidsYear: 2007, FamilyIndicator: 'Family' },
        { Node: 'P005', Name: 'David Smith', BirthYear: 1981, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 28, MarriageYear: 2009, NumKids: 1, HavingKidsAge: 31, HavingKidsYear: 2012, FamilyIndicator: 'Family' }
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
    if (!loading && nodesData.length > 0 && linksData.length > 0) {
      try {
        createBirthYearDistribution()
        createMarriageAgeAnalysis()
        createKidsAnalysis()
        createMarriageTypeDistribution()
        createFamilyTimeline()
        createFamilyGraph()
      } catch (error) {
        console.error('Error creating visualizations:', error)
      }
    }
  }, [loading, nodesData, linksData])

  const createFamilyGraph = () => {
    if (!nodesData || nodesData.length === 0 || !linksData || linksData.length === 0) {
      console.warn('createFamilyGraph: No data available')
      return
    }

    try {
      d3.select('#family-graph-chart').selectAll('*').remove()

      const container = document.getElementById('family-graph-chart')
      
      // Create a simple SVG-based graph
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '1400')
      svg.setAttribute('height', '700')
      svg.style.border = '1px solid #e2e8f0'
      svg.style.borderRadius = '8px'
      svg.style.backgroundColor = '#f8fafc'
      
      container.appendChild(svg)

      // Select 15 random nodes for a balanced graph
      const allValidNodes = nodesData.filter(node => node && node.Node)
      const selectedNodes = allValidNodes
        .sort(() => Math.random() - 0.5) // Shuffle randomly
        .slice(0, 15) // Show 15 random members

      // Create nodes with full width layout and no overlapping
      const nodes = []
      
      selectedNodes.forEach((node, index) => {
        // Use full width with proper spacing for 15 nodes
        const totalWidth = 1400
        const totalHeight = 700
        const nodeSpacing = 160 // Increased spacing to reduce overlap issues
        
        // Calculate positions to avoid overlaps and stay within window
        let x, y
        let attempts = 0
        const maxAttempts = 100
        
        do {
          // Ensure nodes stay well within the visible area with proper margins
          x = Math.random() * (totalWidth - 300) + 150 // Keep 150px margin from edges
          y = Math.random() * (totalHeight - 300) + 150 // Keep 150px margin from edges
          attempts++
          
          // Check if this position overlaps with existing nodes
          const hasOverlap = nodes.some(existingNode => {
            const distance = Math.sqrt(
              Math.pow(x - existingNode.x, 2) + Math.pow(y - existingNode.y, 2)
            )
            return distance < nodeSpacing
          })
          
          if (!hasOverlap || attempts >= maxAttempts) break
        } while (attempts < maxAttempts)
        
        nodes.push({
          ...node,
          x: x,
          y: y,
          radius: 35 // Bigger radius for better name visibility
        })
      })

      // Create simple links only between selected nodes
      const validLinks = linksData.filter(link => 
        link && link.Source && link.Target &&
        nodes.some(n => n.Node === link.Source) &&
        nodes.some(n => n.Node === link.Target)
      )

      console.log('Creating clean family graph with:', nodes.length, 'nodes and', validLinks.length, 'links')

      // Draw links first (so they appear behind nodes) with improved visibility
      validLinks.forEach(link => {
        const sourceNode = nodes.find(n => n.Node === link.Source)
        const targetNode = nodes.find(n => n.Node === link.Target)
        
        if (sourceNode && targetNode) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          line.setAttribute('x1', sourceNode.x)
          line.setAttribute('y1', sourceNode.y)
          line.setAttribute('x2', targetNode.x)
          line.setAttribute('y2', targetNode.y)
          
          // Enhanced link styling with thicker lines for better visibility
          if (link.Types === 'Marriage link') {
            const sourceNodeData = nodesData.find(n => n.Node === link.Source)
            const targetNodeData = nodesData.find(n => n.Node === link.Target)
            const hasKids = (sourceNodeData && sourceNodeData.NumKids > 0) || (targetNodeData && targetNodeData.NumKids > 0)
            
            if (hasKids) {
              // Strong marriage with kids - solid thick line
              line.setAttribute('stroke', '#e53e3e')
              line.setAttribute('stroke-width', '4')
              line.setAttribute('stroke-dasharray', 'none')
            } else {
              // Fluid marriage without kids - dashed thick line
              line.setAttribute('stroke', '#f56565')
              line.setAttribute('stroke-width', '3')
              line.setAttribute('stroke-dasharray', '8,8')
            }
          } else if (link.Types === 'Parent link') {
            line.setAttribute('stroke', '#4299e1')
            line.setAttribute('stroke-width', '3')
            line.setAttribute('stroke-dasharray', '10,5')
          } else {
            line.setAttribute('stroke', '#718096')
            line.setAttribute('stroke-width', '2')
            line.setAttribute('stroke-dasharray', '5,5')
          }
          
          line.setAttribute('fill', 'none')
          // Add data attributes to identify links for highlighting
          line.setAttribute('data-source', link.Source)
          line.setAttribute('data-target', link.Target)
          // Ensure links are always behind nodes
          line.style.zIndex = '-1'
          svg.appendChild(line)

          // Add link label aligned with line direction
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          const midX = (sourceNode.x + targetNode.x) / 2
          const midY = (sourceNode.y + targetNode.y) / 2
          
          // Calculate the angle of the line and adjust for readable text
          const deltaX = targetNode.x - sourceNode.x
          const deltaY = targetNode.y - sourceNode.y
          let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
          
          // Adjust angle to keep text readable (not upside down)
          if (angle > 90 || angle < -90) {
            angle = angle + 180
          }
          
          // For parent links, we'll handle the label text separately to ensure clarity
          
          // Add small offset perpendicular to line direction to avoid overlap
          const offsetDistance = 15
          const perpAngle = angle + 90
          const offsetX = midX + offsetDistance * Math.cos(perpAngle * Math.PI / 180)
          const offsetY = midY + offsetDistance * Math.sin(perpAngle * Math.PI / 180)
          
          // Set label position
          label.setAttribute('x', offsetX)
          label.setAttribute('y', offsetY)
          label.setAttribute('transform', `rotate(${angle} ${offsetX} ${offsetY})`)
          
          label.setAttribute('text-anchor', 'middle')
          label.setAttribute('fill', '#4a5568')
          label.setAttribute('font-size', '10px')
          label.setAttribute('font-weight', 'bold')
          
          // Set label text based on link type
          if (link.Types === 'Marriage link') {
            const sourceNodeData = nodesData.find(n => n.Node === link.Source)
            const targetNodeData = nodesData.find(n => n.Node === link.Target)
            const hasKids = (sourceNodeData && sourceNodeData.NumKids > 0) || (targetNodeData && targetNodeData.NumKids > 0)
            
            // Check if it's same-sex marriage
            const isSameSex = sourceNodeData && targetNodeData && sourceNodeData.Sex === targetNodeData.Sex
            const marriageType = isSameSex ? 'Same-Sex' : 'Married'
            
            label.textContent = hasKids ? `${marriageType} (Strong)` : `${marriageType} (Fluid)`
          } else if (link.Types === 'Parent link') {
            label.textContent = 'Parent → Child'
          } else {
            label.textContent = link.Types
          }
          
          svg.appendChild(label)
        }
      })

      // Create tooltip container with better positioning
      const tooltip = document.createElement('div')
      tooltip.style.position = 'fixed'
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'
      tooltip.style.color = 'white'
      tooltip.style.padding = '12px'
      tooltip.style.borderRadius = '8px'
      tooltip.style.fontSize = '12px'
      tooltip.style.fontFamily = 'Arial, sans-serif'
      tooltip.style.pointerEvents = 'none'
      tooltip.style.zIndex = '9999'
      tooltip.style.display = 'none'
      tooltip.style.maxWidth = '280px'
      tooltip.style.whiteSpace = 'nowrap'
      tooltip.style.border = '2px solid #4299e1'
      tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
      tooltip.style.transform = 'translate(-50%, -100%)'
      tooltip.style.marginTop = '-10px'
      document.body.appendChild(tooltip)

      // Draw nodes
      nodes.forEach(node => {
        // Create node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', node.x)
        circle.setAttribute('cy', node.y)
        circle.setAttribute('r', node.radius)
        
        // Simple color coding
        if (node.Sex === 'Male') {
          circle.setAttribute('fill', '#4299e1')
        } else if (node.Sex === 'Female') {
          circle.setAttribute('fill', '#e53e3e')
        } else {
          circle.setAttribute('fill', '#718096')
        }
        
        circle.setAttribute('stroke', '#fff')
        circle.setAttribute('stroke-width', '2')
        
        // Add hover events using SVG mouse events
        circle.setAttribute('style', 'cursor: pointer;')
        circle.onmouseover = (e) => {
          console.log('Mouse over circle:', node.Name) // Debug log
          
          tooltip.style.left = e.clientX + 'px'
          tooltip.style.top = e.clientY + 'px'
          tooltip.style.display = 'block'
          
          tooltip.innerHTML = `
            <strong>${node.Name || node.Node}</strong><br>
            Birth Year: ${node.BirthYear}<br>
            Sex: ${node.Sex}<br>
            Marriage: ${node.Marriage}<br>
            Marriage Age: ${node.MarriageAge || 'N/A'}<br>
            Marriage Year: ${node.MarriageYear || 'N/A'}<br>
            Number of Kids: ${node.NumKids}<br>
            Having Kids Age: ${node.HavingKidsAge || 'N/A'}<br>
            Having Kids Year: ${node.HavingKidsYear || 'N/A'}<br>
            Family Indicator: ${node.FamilyIndicator}
          `
          
          // Highlight related links when hovering over a node
          validLinks.forEach(link => {
            if (link.Source === node.Node || link.Target === node.Node) {
              const linkElement = svg.querySelector(`line[data-source="${link.Source}"][data-target="${link.Target}"]`)
              if (linkElement) {
                linkElement.setAttribute('stroke-width', '8')
                linkElement.setAttribute('opacity', '1')
              }
            }
          })
        }
        
        circle.onmouseout = () => {
          console.log('Mouse out circle:', node.Name) // Debug log
          tooltip.style.display = 'none'
          
          // Reset link highlighting when mouse leaves node
          validLinks.forEach(link => {
            if (link.Source === node.Node || link.Target === node.Node) {
              const linkElement = svg.querySelector(`line[data-source="${link.Source}"][data-target="${link.Target}"]`)
              if (linkElement) {
                // Reset to original stroke width based on link type
                if (link.Types === 'Marriage link') {
                  const sourceNodeData = nodesData.find(n => n.Node === link.Source)
                  const targetNodeData = nodesData.find(n => n.Node === link.Target)
                  const hasKids = (sourceNodeData && sourceNodeData.NumKids > 0) || (targetNodeData && targetNodeData.NumKids > 0)
                  linkElement.setAttribute('stroke-width', hasKids ? '4' : '3')
                } else if (link.Types === 'Parent link') {
                  linkElement.setAttribute('stroke-width', '3')
                } else {
                  linkElement.setAttribute('stroke-width', '2')
                }
              }
            }
          })
        }
        
        svg.appendChild(circle)

        // Add name label
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        nameText.setAttribute('x', node.x)
        nameText.setAttribute('y', node.y + 5)
        nameText.setAttribute('text-anchor', 'middle')
        nameText.setAttribute('fill', '#fff')
        nameText.setAttribute('font-size', '14px')
        nameText.setAttribute('font-weight', 'bold')
        nameText.textContent = node.Name ? node.Name.split(' ')[0] : node.Node
        
        // Add hover events to text labels too
        nameText.setAttribute('style', 'cursor: pointer;')
        nameText.onmouseover = (e) => {
          console.log('Mouse over text:', node.Name) // Debug log
          
          tooltip.style.left = e.clientX + 'px'
          tooltip.style.top = e.clientY + 'px'
          tooltip.style.display = 'block'
          
          tooltip.innerHTML = `
            <strong>${node.Name || node.Node}</strong><br>
            Birth Year: ${node.BirthYear}<br>
            Sex: ${node.Sex}<br>
            Marriage: ${node.Marriage}<br>
            Marriage Age: ${node.MarriageAge || 'N/A'}<br>
            Marriage Year: ${node.MarriageYear || 'N/A'}<br>
            Number of Kids: ${node.NumKids}<br>
            Having Kids Age: ${node.HavingKidsAge || 'N/A'}<br>
            Having Kids Year: ${node.HavingKidsYear || 'N/A'}<br>
            Family Indicator: ${node.FamilyIndicator}
          `
        }
        
        nameText.onmouseout = () => {
          console.log('Mouse out text:', node.Name) // Debug log
          tooltip.style.display = 'none'
        }
        
        svg.appendChild(nameText)
      })

      // Add simple title
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      title.setAttribute('x', '700')
      title.setAttribute('y', '30')
      title.setAttribute('text-anchor', 'middle')
      title.setAttribute('fill', '#2d3748')
      title.setAttribute('font-size', '18px')
      title.setAttribute('font-weight', 'bold')
      title.textContent = 'Family Relationship Graph (15 Random Members)'
      svg.appendChild(title)

      // Add enhanced legend
      const legend = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      legend.setAttribute('x', '1000')
      legend.setAttribute('y', '60')
      legend.setAttribute('fill', '#4a5568')
      legend.setAttribute('font-size', '12px')
      legend.innerHTML = `
        <tspan x="1000" dy="0">● Red: Female</tspan>
        <tspan x="1000" dy="20">● Blue: Male</tspan>
        <tspan x="1000" dy="20">━━ Red: Married (Strong)</tspan>
        <tspan x="1000" dy="20">┅┅ Red: Married (Fluid)</tspan>
        <tspan x="1000" dy="20">┅┅ Blue: Parent → Child</tspan>
        <tspan x="1000" dy="20">Same-Sex marriages shown</tspan>
        <tspan x="1000" dy="20">15 members, well-spaced</tspan>
        <tspan x="1000" dy="20">Hover nodes to highlight links</tspan>
      `
      svg.appendChild(legend)

      // Add family selection info
      const info = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      info.setAttribute('x', '700')
      info.setAttribute('y', '670')
      info.setAttribute('text-anchor', 'middle')
      info.setAttribute('fill', '#718096')
      info.setAttribute('font-size', '12px')
      info.textContent = `Showing ${nodes.length} random family members. Hover over nodes for details. Refresh to see different families.`
      svg.appendChild(info)

      console.log('Clean family graph created successfully with', nodes.length, 'nodes')
    } catch (error) {
      console.error('Error in createFamilyGraph:', error)
      // Add error message to the chart area
      d3.select('#family-graph-chart')
        .append('div')
        .style('text-align', 'center')
        .style('padding', '2rem')
        .style('color', '#e53e3e')
        .html(`
          <h3>Error Creating Family Graph</h3>
          <p>${error.message}</p>
          <p>Please check the console for more details.</p>
        `)
    }
  }

  // New D3.js-based Family Graph Component
  const createD3FamilyGraph = () => {
    if (!nodesData || nodesData.length === 0 || !linksData || linksData.length === 0) {
      console.warn('createD3FamilyGraph: No data available')
      return
    }

    try {
      d3.select('#d3-family-graph-chart').selectAll('*').remove()

      const container = document.getElementById('d3-family-graph-chart')
      
      // Create SVG container
      const svg = d3.select(container)
        .append('svg')
        .attr('width', 1400)
        .attr('height', 700)
        .style('border', '1px solid #e2e8f0')
        .style('borderRadius', '8px')
        .style('backgroundColor', '#f8fafc')

      // Select 15 random nodes
      const allValidNodes = nodesData.filter(node => node && node.Node)
      const selectedNodes = allValidNodes
        .sort(() => Math.random() - 0.5)
        .slice(0, 15)

      // Create nodes with positions
      const nodes = selectedNodes.map((node, index) => ({
        ...node,
        id: node.Node,
        x: Math.random() * 1100 + 150,
        y: Math.random() * 500 + 100,
        radius: 35
      }))

      // Create links between selected nodes
      const validLinks = linksData.filter(link => 
        link && link.Source && link.Target &&
        nodes.some(n => n.id === link.Source) &&
        nodes.some(n => n.id === link.Target)
      )

      console.log('Creating D3 family graph with:', nodes.length, 'nodes and', validLinks.length, 'links')

      // Create force simulation
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(validLinks).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(700, 350))
        .force('collision', d3.forceCollide().radius(80))

      // Create links
      const links = svg.append('g')
        .selectAll('line')
        .data(validLinks)
        .enter()
        .append('line')
        .attr('stroke', d => {
          if (d.Types === 'Marriage link') {
            const sourceNode = nodesData.find(n => n.Node === d.Source)
            const targetNode = nodesData.find(n => n.Node === d.Target)
            const hasKids = (sourceNode && sourceNode.NumKids > 0) || (targetNode && targetNode.NumKids > 0)
            return hasKids ? '#e53e3e' : '#f56565'
          } else if (d.Types === 'Parent link') {
            return '#4299e1'
          } else {
            return '#718096'
          }
        })
        .attr('stroke-width', d => {
          if (d.Types === 'Marriage link') {
            const sourceNode = nodesData.find(n => n.Node === d.Source)
            const targetNode = nodesData.find(n => n.Node === d.Target)
            const hasKids = (sourceNode && sourceNode.NumKids > 0) || (targetNode && targetNode.NumKids > 0)
            return hasKids ? 3 : 2
          } else if (d.Types === 'Parent link') {
            return 2
          } else {
            return 1
          }
        })
        .attr('stroke-dasharray', d => {
          if (d.Types === 'Marriage link') {
            const sourceNode = nodesData.find(n => n.Node === d.Source)
            const targetNode = nodesData.find(n => n.Node === d.Target)
            const hasKids = (sourceNode && sourceNode.NumKids > 0) || (targetNode && targetNode.NumKids > 0)
            return hasKids ? 'none' : '5,5'
          } else if (d.Types === 'Parent link') {
            return '8,4'
          } else {
            return '3,3'
          }
        })

      // Create nodes
      const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))

      // Add circles to nodes
      nodeGroups.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => {
          if (d.Sex === 'Male') return '#4299e1'
          else if (d.Sex === 'Female') return '#e53e3e'
          else return '#718096'
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      // Add names to nodes
      nodeGroups.append('text')
        .text(d => d.Name ? d.Name.split(' ')[0] : d.Node)
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('fill', '#fff')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')

      // Add link labels
      const linkLabels = svg.append('g')
        .selectAll('text')
        .data(validLinks)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#4a5568')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(d => {
          if (d.Types === 'Marriage link') {
            const sourceNode = nodesData.find(n => n.Node === d.Source)
            const targetNode = nodesData.find(n => n.Node === d.Target)
            const hasKids = (sourceNode && sourceNode.NumKids > 0) || (targetNode && targetNode.NumKids > 0)
            const isSameSex = sourceNode && targetNode && sourceNode.Sex === targetNode.Sex
            const marriageType = isSameSex ? 'Same-Sex' : 'Married'
            return hasKids ? `${marriageType} (Strong)` : `${marriageType} (Fluid)`
          } else if (d.Types === 'Parent link') {
            return 'Child ← Parent'
          } else {
            return d.Types
          }
        })

      // Update positions on simulation tick
      simulation.on('tick', () => {
        links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        nodeGroups
          .attr('transform', d => `translate(${d.x},${d.y})`)

        linkLabels
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2)
      })

      // Drag functions
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      // Add title
      svg.append('text')
        .attr('x', 700)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#2d3748')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text('D3.js Family Graph (15 Random Members)')

      // Add legend
      const legend = svg.append('text')
        .attr('x', 1000)
        .attr('y', 60)
        .attr('fill', '#4a5568')
        .attr('font-size', '12px')

      legend.selectAll('tspan')
        .data([
          '● Red: Female',
          '● Blue: Male',
          '━━ Red: Married (Strong)',
          '┅┅ Red: Married (Fluid)',
          '┅┅ Blue: Parent → Child',
          'Same-Sex marriages shown',
          'Drag nodes to move',
          'D3.js force simulation'
        ])
        .enter()
        .append('tspan')
        .attr('x', 1000)
        .attr('dy', (d, i) => i === 0 ? 0 : 20)
        .text(d => d)

      // Add info
      svg.append('text')
        .attr('x', 700)
        .attr('y', 670)
        .attr('text-anchor', 'middle')
        .attr('fill', '#718096')
        .attr('font-size', '12px')
        .text(`Showing ${nodes.length} random family members. Drag nodes to rearrange. Refresh to see different families.`)

      console.log('D3.js family graph created successfully with', nodes.length, 'nodes')

    } catch (error) {
      console.error('Error in createD3FamilyGraph:', error)
      d3.select('#d3-family-graph-chart')
        .append('div')
        .style('text-align', 'center')
        .style('padding', '2rem')
        .style('color', '#e53e3e')
        .html(`
          <h3>Error Creating D3.js Family Graph</h3>
          <p>${error.message}</p>
          <p>Please check the console for more details.</p>
        `)
    }
  }

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
        <h1>Family Tree & Analytics Dashboard</h1>
        <p>Interactive family tree visualization with comprehensive analysis of family dynamics, marriage patterns, and demographic trends</p>
        
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

          <div className="chart-container full-width">
            <h2>Family Relationship Graph</h2>
            <div id="family-graph-chart"></div>
          </div>


        </div>

        <div className="insights-section">
          <h2>Key Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Family Tree Structure</h3>
              <p>The family tree shows {nodesData.filter(d => d.BirthYear < 1970).length} founding members (born before 1970) with {nodesData.filter(d => d.BirthYear >= 1970 && d.BirthYear < 2000).length} second generation and {nodesData.filter(d => d.BirthYear >= 2000).length} third generation members.</p>
            </div>
            <div className="insight-card">
              <h3>Marriage Trends</h3>
              <p>Most individuals marry between ages 24-30, with opposite-sex marriages being the most common.</p>
            </div>
            <div className="insight-card">
              <h3>Family Formation</h3>
              <p>Families typically have 1-3 children, with peak childbearing occurring in late 20s to early 30s.</p>
            </div>
            <div className="insight-card">
              <h3>Generational Patterns</h3>
              <p>Birth years span from {Math.min(...nodesData.map(d => d.BirthYear))} to {Math.max(...nodesData.map(d => d.BirthYear))}, showing {Math.max(...nodesData.map(d => d.BirthYear)) - Math.min(...nodesData.map(d => d.BirthYear))} years of family history.</p>
            </div>
            <div className="insight-card">
              <h3>Marriage & Family Ratios</h3>
              <p>{marriageRate}% marriage rate with {familyFormationRate}% of married couples forming families with children.</p>
            </div>
            <div className="insight-card">
              <h3>Family Network</h3>
              <p>The network visualization shows {linksData.filter(d => d.Types === 'Marriage link').length} marriage connections and {linksData.filter(d => d.Types === 'Parent link').length} parent-child relationships, creating a complex family web.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
