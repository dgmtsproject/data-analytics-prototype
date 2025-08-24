import { useDataLoader } from './hooks/useDataLoader'
import Header from './components/Header'
import StatsOverview from './components/StatsOverview'
import Charts from './components/Charts'
import Insights from './components/Insights'
import Loading from './components/Loading'
import './Dashboard.css'

function App() {
  const { nodesData, linksData, loading, error, refetch } = useDataLoader()

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Retry Loading Data
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Header nodesData={nodesData} linksData={linksData} />
      
      <main className="dashboard-content">
        <StatsOverview nodesData={nodesData} />
        <Charts nodesData={nodesData} linksData={linksData} />
        <Insights nodesData={nodesData} linksData={linksData} />
      </main>
    </div>
  )
}

export default App
