export const calculateFamilyStats = (nodesData) => {
  if (!nodesData || nodesData.length === 0) {
    return {
      totalIndividuals: 0,
      marriedCouples: 0,
      familiesWithKids: 0,
      singleIndividuals: 0,
      sameSexMarriages: 0,
      oppositeSexMarriages: 0,
      marriageRate: 0,
      familyFormationRate: 0,
      singleRate: 0,
      sameSexMarriageRate: 0,
      averageKidsPerFamily: 0
    }
  }

  const totalIndividuals = nodesData.length
  const marriedCouples = nodesData.filter(d => d.Marriage !== 'Single').length
  const familiesWithKids = nodesData.filter(d => d.NumKids > 0).length
  const singleIndividuals = nodesData.filter(d => d.Marriage === 'Single').length
  const sameSexMarriages = nodesData.filter(d => d.Marriage === 'sameSexMarried').length
  const oppositeSexMarriages = nodesData.filter(d => d.Marriage === 'oppositeSexMarried').length
  
  const marriageRate = ((marriedCouples / totalIndividuals) * 100).toFixed(1)
  const familyFormationRate = marriedCouples > 0 ? ((familiesWithKids / marriedCouples) * 100).toFixed(1) : 0
  const singleRate = ((singleIndividuals / totalIndividuals) * 100).toFixed(1)
  const sameSexMarriageRate = marriedCouples > 0 ? ((sameSexMarriages / marriedCouples) * 100).toFixed(1) : 0
  
  const familiesWithKidsData = nodesData.filter(d => d.NumKids > 0)
  const averageKidsPerFamily = familiesWithKidsData.length > 0 
    ? (familiesWithKidsData.reduce((sum, d) => sum + d.NumKids, 0) / familiesWithKidsData.length).toFixed(1)
    : 0

  return {
    totalIndividuals,
    marriedCouples,
    familiesWithKids,
    singleIndividuals,
    sameSexMarriages,
    oppositeSexMarriages,
    marriageRate,
    familyFormationRate,
    singleRate,
    sameSexMarriageRate,
    averageKidsPerFamily
  }
}
