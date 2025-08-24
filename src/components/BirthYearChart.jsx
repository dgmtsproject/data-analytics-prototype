import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function BirthYearChart({ nodesData }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return

    const createBirthYearDistribution = () => {
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

    createBirthYearDistribution()
  }, [nodesData])

  return (
    <div className="chart-container">
      <h2>Birth Year Distribution</h2>
      <div ref={chartRef}></div>
    </div>
  )
}
