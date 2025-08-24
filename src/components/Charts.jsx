import BirthYearChart from './BirthYearChart'
import MarriageAgeChart from './MarriageAgeChart'
import KidsAnalysisChart from './KidsAnalysisChart'
import MarriageTypeChart from './MarriageTypeChart'
import FamilyTimelineChart from './FamilyTimelineChart'
import FamilyScatterGraph from './FamilyScatterGraph'

export default function Charts({ nodesData, linksData }) {
  return (
    <div className="charts-grid">
      <BirthYearChart nodesData={nodesData} />
      <MarriageAgeChart nodesData={nodesData} />
      <KidsAnalysisChart nodesData={nodesData} />
      <MarriageTypeChart nodesData={nodesData} />
      
      <div className="chart-container full-width">
        <FamilyTimelineChart nodesData={nodesData} />
      </div>

      <FamilyScatterGraph nodesData={nodesData} linksData={linksData} />
    </div>
  )
}
