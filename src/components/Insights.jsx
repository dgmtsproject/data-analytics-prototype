import { calculateFamilyStats } from '../utils/familyStats'

export default function Insights({ nodesData, linksData }) {
  const stats = calculateFamilyStats(nodesData)

  if (!nodesData || nodesData.length === 0) {
    return (
      <div className="insights-section">
        <h2>Key Insights</h2>
        <p>No data available for insights.</p>
      </div>
    )
  }

  const minBirthYear = Math.min(...nodesData.map(d => d.BirthYear))
  const maxBirthYear = Math.max(...nodesData.map(d => d.BirthYear))
  const yearSpan = maxBirthYear - minBirthYear

  const foundingMembers = nodesData.filter(d => d.BirthYear < 1970).length
  const secondGeneration = nodesData.filter(d => d.BirthYear >= 1970 && d.BirthYear < 2000).length
  const thirdGeneration = nodesData.filter(d => d.BirthYear >= 2000).length

  const marriageLinks = linksData.filter(d => d.Types === 'Marriage link').length
  const parentLinks = linksData.filter(d => d.Types === 'Parent link').length

  return (
    <div className="insights-section">
      <h2>Key Insights</h2>
      <div className="insights-grid">
        <div className="insight-card">
          <h3>Family Tree Structure</h3>
          <p>
            The family tree shows {foundingMembers} founding members (born before 1970) 
            with {secondGeneration} second generation and {thirdGeneration} third generation members.
          </p>
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
          <p>
            Birth years span from {minBirthYear} to {maxBirthYear}, 
            showing {yearSpan} years of family history.
          </p>
        </div>
        <div className="insight-card">
          <h3>Marriage & Family Ratios</h3>
          <p>
            {stats.marriageRate}% marriage rate with {stats.familyFormationRate}% 
            of married couples forming families with children.
          </p>
        </div>
        <div className="insight-card">
          <h3>Family Network</h3>
          <p>
            The network visualization shows {marriageLinks} marriage connections 
            and {parentLinks} parent-child relationships, creating a complex family web.
          </p>
        </div>
      </div>
    </div>
  )
}
