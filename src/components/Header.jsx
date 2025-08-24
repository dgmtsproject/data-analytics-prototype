import { downloadNodesCSV, downloadLinksCSV, downloadAllData } from '../utils/csvDownload'

export default function Header({ nodesData, linksData }) {
  return (
    <header className="dashboard-header">
      <h1>Family Tree & Analytics Dashboard</h1>
      <p>Interactive family tree visualization with comprehensive analysis of family dynamics, marriage patterns, and demographic trends</p>
      
      <div className="download-section">
        <h3>Download Data</h3>
        <div className="download-buttons">
          <button 
            onClick={() => downloadNodesCSV(nodesData)} 
            className="download-btn"
            disabled={!nodesData || nodesData.length === 0}
          >
            📊 Download Nodes CSV
          </button>
          <button 
            onClick={() => downloadLinksCSV(linksData)} 
            className="download-btn"
            disabled={!linksData || linksData.length === 0}
          >
            🔗 Download Links CSV
          </button>
          <button 
            onClick={() => downloadAllData(nodesData, linksData)} 
            className="download-btn primary"
            disabled={!nodesData || nodesData.length === 0}
          >
            📁 Download All Data
          </button>
        </div>
      </div>
    </header>
  )
}
