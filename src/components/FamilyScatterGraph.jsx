import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'

export default function FamilyScatterGraph({ nodesData, linksData }) {
  const svgRef = useRef(null)
  const wrapperRef = useRef(null)

  // Build maps for styling logic
  const { parentCountByChild, childCountByParent, childToParents } = useMemo(() => {
    const parentLinks = (linksData || []).filter(l => l && l.Types === 'Parent link' && l.Source && l.Target)
    const parentCountByChild = new Map()
    const childCountByParent = new Map()
    const childToParents = new Map()
    parentLinks.forEach(l => {
      parentCountByChild.set(l.Target, (parentCountByChild.get(l.Target) || 0) + 1)
      childCountByParent.set(l.Source, (childCountByParent.get(l.Source) || 0) + 1)
      if (!childToParents.has(l.Target)) childToParents.set(l.Target, new Set())
      childToParents.get(l.Target).add(l.Source)
    })
    return { parentCountByChild, childCountByParent, childToParents }
  }, [linksData])

  const nodes = useMemo(() => {
    return (nodesData || []).filter(n => n && n.Node).map(n => ({
      id: n.Node,
      label: n.Name || n.Node,
      sex: n.Sex,
      raw: n,
    }))
  }, [nodesData])

  const marriageLinks = useMemo(() => {
    return (linksData || [])
      .filter(l => l && l.Types === 'Marriage link' && l.Source && l.Target)
      .map(l => ({ type: 'marriage', source: l.Source, target: l.Target }))
  }, [linksData])

  const parentLinks = useMemo(() => {
    const raw = (linksData || [])
      .filter(l => l && l.Types === 'Parent link' && l.Source && l.Target)
      .map(l => ({ type: 'parent', source: l.Source, target: l.Target }))

    // Build marriage pair set to prefer married parents when >2
    const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)
    const marriedPairs = new Set(
      (linksData || [])
        .filter(l => l && l.Types === 'Marriage link' && l.Source && l.Target)
        .map(l => pairKey(l.Source, l.Target))
    )

    // Group parents by child
    const childToParentsArr = new Map()
    raw.forEach(l => {
      if (!childToParentsArr.has(l.target)) childToParentsArr.set(l.target, [])
      childToParentsArr.get(l.target).push(l.source)
    })

    const filtered = []
    childToParentsArr.forEach((parents, child) => {
      // unique parents
      const uniq = Array.from(new Set(parents))
      if (uniq.length <= 2) {
        uniq.forEach(p => filtered.push({ type: 'parent', source: p, target: child }))
      } else {
        // Prefer a married pair among the parents
        let chosen = null
        for (let i = 0; i < uniq.length && !chosen; i++) {
          for (let j = i + 1; j < uniq.length && !chosen; j++) {
            if (marriedPairs.has(pairKey(uniq[i], uniq[j]))) {
              chosen = [uniq[i], uniq[j]]
            }
          }
        }
        if (!chosen) {
          // Fallback: pick first two consistently
          chosen = uniq.slice(0, 2)
        }
        // Warn for data quality
        try {
          // eslint-disable-next-line no-console
          console.warn(`Child ${child} has ${uniq.length} parents in CSV; using only: ${chosen.join(', ')}`)
        } catch {}
        chosen.forEach(p => filtered.push({ type: 'parent', source: p, target: child }))
      }
    })

    return filtered
  }, [linksData])

  useEffect(() => {
    if (!nodes || nodes.length === 0) return

    const wrapper = wrapperRef.current
    const width = wrapper?.clientWidth ? Math.max(800, wrapper.clientWidth) : 1200
    const height = 700

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg.attr('width', width).attr('height', height)

    // Transparent backdrop to capture zoom/pan
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'transparent')

    const g = svg.append('g')

    // Arrow marker for parent links (optional)
    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'arrow-parent')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64748b')

    // Layers
    const marriageLayer = g.append('g')
    const parentLayer = g.append('g')
    const labelLayer = g.append('g')
    const nodeLayer = g.append('g')

    // Maps for sex/name lookup
    const idToSex = new Map((nodesData || []).map(n => [n.Node, n.Sex]))
    const idOf = (v) => (typeof v === 'object' ? v.id : v)

    // Draw links
    const marriageSel = marriageLayer.selectAll('line')
      .data(marriageLinks)
      .join('line')
      .attr('stroke', d => {
        const s1 = idToSex.get(idOf(d.source))
        const s2 = idToSex.get(idOf(d.target))
        return s1 && s2 && s1 === s2 ? '#22c55e' /* green for same-sex */ : '#ef4444' /* red for opposite-sex */
      })
      .attr('stroke-width', 6)
      .attr('opacity', 0.95)

    const parentSel = parentLayer.selectAll('line')
      .data(parentLinks)
      .join('line')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8,5')
      .attr('marker-end', 'url(#arrow-parent)')
      .attr('opacity', 0.9)

    // Link labels
    const marriageLabels = labelLayer.selectAll('text.marriage')
      .data(marriageLinks)
      .join('text')
      .attr('class', 'marriage')
      .attr('font-size', 10)
      .attr('fill', d => {
        const s1 = idToSex.get(idOf(d.source))
        const s2 = idToSex.get(idOf(d.target))
        return s1 && s2 && s1 === s2 ? '#14532d' : '#7f1d1d'
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('pointer-events', 'none')
      .text(d => {
        const s1 = idToSex.get(idOf(d.source))
        const s2 = idToSex.get(idOf(d.target))
        const same = s1 && s2 && s1 === s2
        return same ? 'married (same-sex)' : 'married'
      })

    const parentLabels = labelLayer.selectAll('text.parent')
      .data(parentLinks)
      .join('text')
      .attr('class', 'parent')
      .attr('font-size', 10)
      .attr('fill', '#475569')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('pointer-events', 'none')
      .text('parent → child')

    // Node groups for circle + label
    const nodeGroups = nodeLayer.selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    const isLeafChildWithTwoParents = (nodeId) => {
      const parents = parentCountByChild.get(nodeId) || 0
      const children = childCountByParent.get(nodeId) || 0
      return parents >= 2 && children === 0
    }

    const circle = nodeGroups.append('circle')
      .attr('r', d => isLeafChildWithTwoParents(d.id) ? 8 : 12)
      .attr('fill', d => {
        if (isLeafChildWithTwoParents(d.id)) return '#a78bfa' // purple for leaf child of two parents
        if (d.sex === 'Male') return '#3b82f6'
        if (d.sex === 'Female') return '#ef4444'
        return '#64748b'
      })
      .attr('stroke', '#111827')
      .attr('stroke-width', d => isLeafChildWithTwoParents(d.id) ? 1 : 1.5)

    nodeGroups.append('text')
      .text(d => d.label)
      .attr('x', 14)
      .attr('y', 4)
      .attr('font-size', 12)
      .attr('fill', '#0f172a')

    // Child-of label under node when exactly two parents and no children
    const idToName = new Map((nodesData || []).map(n => [n.Node, n.Name || n.Node]))
    const idToInitial = new Map((nodesData || []).map(n => {
      const name = n.Name || n.Node
      const initial = name && name.length > 0 ? (name.trim().split(/\s+/)[0][0] || name[0]).toUpperCase() : (n.Node ? n.Node[0] : '?')
      return [n.Node, initial]
    }))

    nodeGroups.append('text')
      .attr('class', 'child-of')
      .attr('x', 14)
      .attr('y', 18)
      .attr('font-size', 10)
      .attr('fill', '#64748b')
      .text(d => {
        const parents = childToParents.get(d.id)
        const children = childCountByParent.get(d.id) || 0
        if (parents && parents.size === 2 && children === 0) {
          const arr = [...parents]
          const i1 = idToInitial.get(arr[0]) || '?'
          const i2 = idToInitial.get(arr[1]) || '?'
          return `child of (${i1}, ${i2})`
        }
        return ''
      })

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link-marriage', d3.forceLink(marriageLinks).id(d => d.id).distance(260).strength(0.85))
      .force('link-parent', d3.forceLink(parentLinks).id(d => d.id).distance(220).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (isLeafChildWithTwoParents(d.id) ? 28 : 34)))

    simulation.on('tick', () => {
      marriageSel
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      parentSel
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      marriageLabels
        .each(function(d) {
          const midX = (d.source.x + d.target.x) / 2
          const midY = (d.source.y + d.target.y) / 2
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          let angle = Math.atan2(dy, dx) * 180 / Math.PI
          if (angle > 90 || angle < -90) angle += 180
          const offset = 12
          const rad = (angle + 90) * Math.PI / 180
          const ox = offset * Math.cos(rad)
          const oy = offset * Math.sin(rad)
          d3.select(this)
            .attr('x', midX + ox)
            .attr('y', midY + oy)
            .attr('transform', `rotate(${angle} ${midX + ox} ${midY + oy})`)
        })

      parentLabels
        .each(function(d) {
          const midX = (d.source.x + d.target.x) / 2
          const midY = (d.source.y + d.target.y) / 2
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const angle = Math.atan2(dy, dx) * 180 / Math.PI
          const offset = 12
          const rad = (angle + 90) * Math.PI / 180
          const ox = offset * Math.cos(rad)
          const oy = offset * Math.sin(rad)
          const sel = d3.select(this)
          sel
            .attr('x', midX + ox)
            .attr('y', midY + oy)
            .attr('transform', `rotate(${angle} ${midX + ox} ${midY + oy})`)
            .text('parent → child')
        })

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Zoom & pan
    const zoom = d3.zoom().scaleExtent([0.5, 2.5]).on('zoom', (event) => {
      g.attr('transform', event.transform)
    })
    svg.call(zoom)

    return () => simulation.stop()
  }, [nodes, marriageLinks, parentLinks, parentCountByChild, childCountByParent, childToParents, nodesData])

  return (
    <div className="chart-container full-width" ref={wrapperRef}>
      <h2>Family Relationship Network</h2>
      <svg ref={svgRef} className="w-full h-[700px]"></svg>
    </div>
  )
}


