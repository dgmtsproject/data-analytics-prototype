import { calculateFamilyStats } from '../utils/familyStats'

export default function StatsOverview({ nodesData }) {
  const stats = calculateFamilyStats(nodesData)

  return (
    <>
      <div className="overview-stats">
        <div className="stat-card">
          <h3>Total Individuals</h3>
          <p className="stat-value">{stats.totalIndividuals}</p>
        </div>
        <div className="stat-card">
          <h3>Married Couples</h3>
          <p className="stat-value">{stats.marriedCouples}</p>
          <p className="stat-ratio">({stats.marriageRate}%)</p>
        </div>
        <div className="stat-card">
          <h3>Families with Kids</h3>
          <p className="stat-value">{stats.familiesWithKids}</p>
          <p className="stat-ratio">({stats.familyFormationRate}% of married)</p>
        </div>
        <div className="stat-card">
          <h3>Average Kids per Family</h3>
          <p className="stat-value">{stats.averageKidsPerFamily}</p>
        </div>
      </div>

      <div className="ratio-stats">
        <div className="ratio-card">
          <h3>Marriage Rate</h3>
          <p className="ratio-value">{stats.marriageRate}%</p>
          <p className="ratio-description">of total population is married</p>
        </div>
        <div className="ratio-card">
          <h3>Single Rate</h3>
          <p className="ratio-value">{stats.singleRate}%</p>
          <p className="ratio-description">of population is single</p>
        </div>
        <div className="ratio-card">
          <h3>Same-Sex Marriage Rate</h3>
          <p className="ratio-value">{stats.sameSexMarriageRate}%</p>
          <p className="ratio-description">of married couples</p>
        </div>
        <div className="ratio-card">
          <h3>Family Formation Rate</h3>
          <p className="ratio-value">{stats.familyFormationRate}%</p>
          <p className="ratio-description">of married couples have children</p>
        </div>
      </div>
    </>
  )
}
