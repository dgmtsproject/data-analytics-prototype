import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function FamilyTimelineChart({ nodesData }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return

    const createFamilyTimeline = () => {
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

    createFamilyTimeline()
  }, [nodesData])

  return (
    <div className="chart-container">
      <h2>Family Formation Timeline</h2>
      <div ref={chartRef}></div>
    </div>
  )
}
