import { useState, useEffect } from 'react'
import * as d3 from 'd3'

export function useDataLoader() {
  const [nodesData, setNodesData] = useState([])
  const [linksData, setLinksData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real app, you'd fetch from API endpoints
      // For now, we'll use the CSV data directly
      const nodesResponse = await fetch('./nodes.csv')
      const linksResponse = await fetch('./links.csv')
      
      if (!nodesResponse.ok || !linksResponse.ok) {
        throw new Error(`Failed to fetch data: nodes=${nodesResponse.status}, links=${linksResponse.status}`)
      }
      
      const nodesText = await nodesResponse.text()
      const linksText = await linksResponse.text()
      
      const nodes = d3.csvParse(nodesText)
      const links = d3.csvParse(linksText)
      
      console.log('Loaded nodes:', nodes.length)
      console.log('Loaded links:', links.length)
      console.log('Sample nodes:', nodes.slice(0, 3))
      console.log('Sample links:', links.slice(0, 3))
      
      // Convert numeric fields to numbers
      const processedNodes = nodes.map(node => ({
        ...node,
        BirthYear: parseInt(node.BirthYear) || 0,
        MarriageAge: parseInt(node.MarriageAge) || 0,
        MarriageYear: parseInt(node.MarriageYear) || 0,
        NumKids: parseInt(node.NumKids) || 0,
        HavingKidsAge: parseInt(node.HavingKidsAge) || 0,
        HavingKidsYear: parseInt(node.HavingKidsYear) || 0
      }))
      
      setNodesData(processedNodes)
      setLinksData(links)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      
      // Fallback to sample data
      const sampleNodes = [
        { Node: 'P001', Name: 'John Smith', BirthYear: 1950, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 25, MarriageYear: 1975, NumKids: 3, HavingKidsAge: 28, HavingKidsYear: 1978, FamilyIndicator: 'Family' },
        { Node: 'P002', Name: 'Mary Johnson', BirthYear: 1952, Sex: 'Female', Marriage: 'oppositeSexMarried', MarriageAge: 23, MarriageYear: 1975, NumKids: 3, HavingKidsAge: 26, HavingKidsYear: 1978, FamilyIndicator: 'Family' },
        { Node: 'P003', Name: 'Michael Smith', BirthYear: 1978, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 26, MarriageYear: 2004, NumKids: 2, HavingKidsAge: 29, HavingKidsYear: 2007, FamilyIndicator: 'Family' },
        { Node: 'P004', Name: 'Sarah Williams', BirthYear: 1980, Sex: 'Female', Marriage: 'oppositeSexMarried', MarriageAge: 24, MarriageYear: 2004, NumKids: 2, HavingKidsAge: 27, HavingKidsYear: 2007, FamilyIndicator: 'Family' },
        { Node: 'P005', Name: 'David Smith', BirthYear: 1981, Sex: 'Male', Marriage: 'oppositeSexMarried', MarriageAge: 28, MarriageYear: 2009, NumKids: 1, HavingKidsAge: 31, HavingKidsYear: 2012, FamilyIndicator: 'Family' }
      ]
      setNodesData(sampleNodes)
      setLinksData([])
      setLoading(false)
    }
  }

  const refetch = () => {
    loadData()
  }

  return {
    nodesData,
    linksData,
    loading,
    error,
    refetch
  }
}
