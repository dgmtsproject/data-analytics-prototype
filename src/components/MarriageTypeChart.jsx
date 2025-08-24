import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function MarriageTypeChart({ nodesData }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return

    const createMarriageTypeDistribution = () => {
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

    createMarriageTypeDistribution()
  }, [nodesData])

  return (
    <div className="chart-container">
      <h2>Marriage Type Distribution</h2>
      <div ref={chartRef}></div>
    </div>
  )
}
