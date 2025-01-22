import { countUniqueLocations, calculateLocationDistribution } from './helpers';
import { findOverloadedLocations } from './balancer'; // Add this import

export function calculateDailyTarget(counts, day, locationList) {
  const oofCount = counts[day]?.['OOF'] || 0;  // Ensure OOF is handled correctly
  const availableStaff = Object.values(counts[day] || {}).reduce((sum, count) => sum + count, 0) - oofCount;
  return Math.floor(availableStaff / locationList.length);
}

export function calculateRosterScore(counts, days, locationList, roster, weeklyLocationsRequired) {
  let score = 0;
  let hasEmptyLocations = false;  // Add this line to define the variable
  const weights = {
    overloadPenalty: 2000,    // Increased weight for overloaded locations
    spreadPenalty: 50,       // Medium weight for general spread
    balancePenalty: 50       // Lower weight for minor imbalances
  };

  // Calculate overload penalties for each day
  days.forEach(day => {
    const overloadedLocations = findOverloadedLocations(counts, day);
    // Exponential penalty based on number of overloaded locations
    if (overloadedLocations.length > 0) {
      const overloadPenalty = Math.pow(2, overloadedLocations.length) * weights.overloadPenalty;
      score += overloadPenalty;

      // Additional penalty based on severity of overload
      overloadedLocations.forEach(([loc, count]) => {
        const locations = Object.entries(counts[day])
          .filter(([l]) => l !== 'OOF');
        const minCount = Math.min(...locations.map(([, c]) => c));
        const excess = count - (minCount + 1);
        score += Math.pow(3, excess) * weights.overloadPenalty;
      });
    }

    // Rest of the daily scoring
    const locations = Object.entries(counts[day])
      .filter(([loc]) => loc !== 'OOF');
    
    if (locations.length > 0) {
      const staffCounts = locations.map(([, count]) => count);
      const min = Math.min(...staffCounts);
      const max = Math.max(...staffCounts);
      const spread = max - min;
      
      // Penalize large spreads
      score += Math.pow(spread, 2) * weights.spreadPenalty;
      
      // Penalize deviations from ideal distribution
      const totalStaff = staffCounts.reduce((a, b) => a + b, 0);
      const idealCount = totalStaff / locations.length;
      const balancePenalty = locations.reduce((penalty, [, count]) => {
        return penalty + Math.abs(count - idealCount) * weights.balancePenalty;
      }, 0);
      
      score += balancePenalty;
    }
  });

  // Existing scoring for daily balance and empty locations
  days.forEach(day => {
    const dailyTarget = calculateDailyTarget(counts, day, locationList);
    locationList.forEach(loc => {
      const count = counts[day][loc];
      if (count === 0) {
        score += 1000;
        hasEmptyLocations = true;
      } else {
        const diff = Math.abs(count - dailyTarget);
        score += diff * diff;
      }
    });
  });

  // Existing scoring for unique locations requirement
  roster.forEach(({assignment}) => {
    const uniqueCount = countUniqueLocations(assignment);
    if (uniqueCount !== weeklyLocationsRequired) {
      score += 5000;
    }
    
    // Add location distribution preference (lower weight than other requirements)
    const distributionScore = calculateLocationDistribution(assignment);
    score += distributionScore * 50; // Adjust weight as needed
  });

  return { score, hasEmptyLocations };
}
