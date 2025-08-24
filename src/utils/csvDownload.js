import * as d3 from 'd3'

export const downloadCSV = (data, filename) => {
  const csvContent = d3.csvFormat(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const downloadNodesCSV = (nodesData) => {
  downloadCSV(nodesData, 'family_nodes_data.csv')
}

export const downloadLinksCSV = (linksData) => {
  downloadCSV(linksData, 'family_links_data.csv')
}

export const downloadAllData = (nodesData, linksData) => {
  // Download both CSVs with a small delay
  downloadCSV(nodesData, 'family_nodes_data.csv')
  setTimeout(() => {
    downloadCSV(linksData, 'family_links_data.csv')
  }, 500)
}
