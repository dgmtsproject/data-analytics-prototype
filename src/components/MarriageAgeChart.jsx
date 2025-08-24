import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function MarriageAgeChart({ nodesData }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return

    const createMarriageAgeAnalysis = () => {
      d3.select(chartRef.current).selectAll('*').remove()

      const margin = { top: 20, right: 20, bottom: 40, left: 60 }
      const width = 500 - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom

      const svg = d3.select(chartRef.current)
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

    createMarriageAgeAnalysis()
  }, [nodesData])

  return (
    <div className="chart-container">
      <h2>Marriage Age Analysis</h2>
      <div ref={chartRef}></div>
    </div>
  )
}
