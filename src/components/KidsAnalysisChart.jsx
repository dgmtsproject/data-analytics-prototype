import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function KidsAnalysisChart({ nodesData }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return

    const createKidsAnalysis = () => {
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

    createKidsAnalysis()
  }, [nodesData])

  return (
    <div className="chart-container">
      <h2>Family Size Analysis</h2>
      <div ref={chartRef}></div>
    </div>
  )
}
