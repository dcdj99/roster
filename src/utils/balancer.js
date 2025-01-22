import { countStaffPerLocation, countUniqueLocations, validateRoster } from './helpers';
import { calculateRosterScore } from './scoring';

export function findOverloadedLocations(counts, day) {
  const locations = Object.entries(counts[day])
    .filter(([loc]) => loc !== 'OOF');  // Changed from WFH to OOF
  
  if (locations.length === 0) return [];
  
  // Find the lowest frequency including empty locations
  const lowestFreq = Math.min(...locations.map(([, count]) => count));

  // Location is overloaded if it has 2+ more staff than lowest frequency
  return locations
    .filter(([, count]) => count >= lowestFreq + 2)
    .sort(([, a], [, b]) => b - a);
}

function getLocationSets(assignment, weeklyLocationsRequired) {
  const uniqueLocations = new Set(assignment.filter(loc => loc !== 'OOF'));
  // Only return the set if it has exactly the required number of locations
  return uniqueLocations.size === weeklyLocationsRequired ? Array.from(uniqueLocations) : null;
}

function canMoveToLocation(staff, targetLoc, dayIdx, weeklyLocationsRequired) {
  // Get current set of locations for this staff member
  const currentLocations = new Set(staff.assignment
    .filter((loc, idx) => loc !== 'OOF' && idx !== dayIdx));
  
  // Add the potential new location
  currentLocations.add(targetLoc);
  
  // Check if this would maintain the required number of unique locations
  return currentLocations.size <= weeklyLocationsRequired;
}

function generatePossibleMoves(roster, fromLoc, dayIdx, counts, day, locationList, weeklyLocationsRequired, steps = 1) {
  const moves = [];
  const attempted = new Set();

  function recursive(currentMoves, remainingSteps) {
    if (remainingSteps === 0) {
      if (isValidMoveChain(currentMoves, weeklyLocationsRequired)) {
        moves.push(createMove(currentMoves));
      }
      return;
    }

    // Get staff at current locations for this day
    const staffAtLocations = roster.map((staff) => ({
      staff,
      currentLoc: staff.assignment[dayIdx],
      currentSet: getLocationSets(staff.assignment, weeklyLocationsRequired)
    }));

    staffAtLocations.forEach(({ staff, currentLoc, currentSet }) => {
      if (currentLoc === 'OOF') return;

      locationList.forEach(targetLoc => {
        if (targetLoc === currentLoc) return;
        
        const moveKey = `${staff.staff}-${currentLoc}-${targetLoc}-${remainingSteps}`;
        if (attempted.has(moveKey)) return;
        attempted.add(moveKey);

        // Only allow moves that maintain the required number of unique locations
        if (canMoveToLocation(staff, targetLoc, dayIdx, weeklyLocationsRequired)) {
          const move = {
            staff,
            fromLoc: currentLoc,
            toLoc: targetLoc,
            dayIdx
          };

          recursive([...currentMoves, move], remainingSteps - 1);
        }
      });
    });
  }

  function isValidMoveChain(moveChain, weeklyLocationsRequired) {
    const tempAssignments = roster.map(staff => ({
      staff: staff.staff,
      assignment: [...staff.assignment]
    }));

    moveChain.forEach(move => {
      const staffAssignment = tempAssignments.find(s => s.staff === move.staff.staff);
      if (staffAssignment) {
        staffAssignment.assignment[move.dayIdx] = move.toLoc;
      }
    });

    // Verify all assignments maintain correct number of unique locations
    return tempAssignments.every(({ assignment }) => {
      const locationSet = new Set(assignment.filter(loc => loc !== 'OOF'));
      return locationSet.size === weeklyLocationsRequired;
    });
  }

  function createMove(moveChain) {
    return {
      staffChain: moveChain.map(m => m.staff),
      locationChain: [fromLoc, ...moveChain.map(m => m.toLoc)]
    };
  }

  recursive([], steps);
  return moves;
}

function applyMove(move, dayIdx) {
  move.staffChain.forEach((staff, index) => {
    staff.assignment[dayIdx] = move.locationChain[index + 1] || move.locationChain[index];
  });
}

function revertMove(move, dayIdx, originalAssignments) {
  move.staffChain.forEach((staff, index) => {
    staff.assignment[dayIdx] = originalAssignments[index];
  });
}

function calculateDailyDistributionQuality(counts, day) {
  const locations = Object.entries(counts[day])
    .filter(([loc]) => loc !== 'OOF');
  
  if (locations.length === 0) return { balanced: true, spread: 0 };
  
  const staffCounts = locations.map(([, count]) => count);  // Renamed from 'counts' to 'staffCounts'
  const min = Math.min(...staffCounts);
  const max = Math.max(...staffCounts);
  const spread = max - min;
  
  return {
    balanced: spread <= 1,
    spread,
    min,
    max
  };
}

export function balanceLocations(
  rosterData,
  locationList,
  weeklyLocationsRequired
) {
  const { days, roster } = rosterData;
  if (!roster || roster.length === 0) {
    return {
      days,
      roster: [],
      isValid: false,
      message: "Error: Invalid roster data"
    };
  }

  // Calculate max possible steps based on assignable roster spots
  const totalRosterSpots = days.length * roster.length;
  const totalOofDays = roster.reduce((sum, { assignment }) => 
    sum + assignment.filter(loc => loc === 'OOF').length, 0);
  const maxPossibleSteps = totalRosterSpots - totalOofDays - 1;

  let bestScore = Infinity;
  let bestRoster = JSON.parse(JSON.stringify(roster));
  let maxSteps = 1;
  let passNumber = 0;
  let improvedInPass = true;
  let stuckCount = 0;
  const MAX_STUCK_ATTEMPTS = 3;

//   console.log(`Maximum possible steps: ${maxPossibleSteps} (${totalRosterSpots} total spots - ${totalOofDays} OOF days - 1)`);

  while (improvedInPass) {
    passNumber++;
    improvedInPass = false;
    // console.log(`\nStarting pass ${passNumber} with max steps ${maxSteps}`);

    let hasOverloadedLocations = false;
    
    days.forEach((day, dayIdx) => {
      const counts = countStaffPerLocation(roster, days, locationList);
      const distribution = calculateDailyDistributionQuality(counts, day);
      const { score: currentScore } = calculateRosterScore(
        counts,
        days,
        locationList,
        roster,
        weeklyLocationsRequired
      );
      
    //   console.log(`${day} distribution - min: ${distribution.min}, max: ${distribution.max}, spread: ${distribution.spread}`);
      
      if (!distribution.balanced) {
        hasOverloadedLocations = true;
        const overloadedLocations = findOverloadedLocations(counts, day);

        // Try increasingly complex moves until balance is achieved
        for (let steps = 1; steps <= maxSteps; steps++) {
          let improvedInDay = false;
          
          // Try all overloaded locations
          for (const [fromLoc] of overloadedLocations) {
            const possibleMoves = generatePossibleMoves(
              roster, fromLoc, dayIdx, counts, day, locationList, weeklyLocationsRequired, steps
            );

            // Sort moves prioritizing maintenance of weekly location requirements
            possibleMoves.sort((a, b) => {
              const aValid = canMoveToLocation(a.staffChain[0], a.locationChain[1], dayIdx, weeklyLocationsRequired);
              const bValid = canMoveToLocation(b.staffChain[0], b.locationChain[1], dayIdx, weeklyLocationsRequired);
              if (aValid === bValid) {
                return (counts[day][a.locationChain[1]] || 0) - (counts[day][b.locationChain[1]] || 0);
              }
              return aValid ? -1 : 1;
            });

            for (const move of possibleMoves) {
              const originalAssignments = move.staffChain.map(staff => staff.assignment[dayIdx]);
              applyMove(move, dayIdx);

              const newCounts = countStaffPerLocation(roster, days, locationList);
              const { score: newScore } = calculateRosterScore(newCounts, days, locationList, roster, weeklyLocationsRequired);
              const newDistribution = calculateDailyDistributionQuality(newCounts, day);

              if (newScore < currentScore || newDistribution.spread < distribution.spread) {
                improvedInDay = true;
                improvedInPass = true;
                stuckCount = 0;
                
                if (newScore < bestScore) {
                  bestScore = newScore;
                  bestRoster = JSON.parse(JSON.stringify(roster));
                }
                break;
              } else {
                revertMove(move, dayIdx, originalAssignments);
              }
            }
            if (improvedInDay) break;
          }
          if (improvedInDay) break;
        }
      }
    });

    if (!improvedInPass) {
      if (hasOverloadedLocations) {
        stuckCount++;
        if (stuckCount < MAX_STUCK_ATTEMPTS) {
          // Try increasing complexity when stuck
          maxSteps = Math.min(maxSteps + stuckCount, maxPossibleSteps);
          improvedInPass = true;
          //console.log(`Stuck with overloaded locations. Increasing max steps to ${maxSteps} (attempt ${stuckCount})`);
        } else {
          //.log('Unable to further balance locations after multiple attempts');
        }
      } else if (maxSteps < maxPossibleSteps) {
        maxSteps++;
        improvedInPass = true;
        // console.log(`No improvements found. Increasing max steps to ${maxSteps}/${maxPossibleSteps} for next pass`);
      } else {
        // console.log(`No improvements possible with up to ${maxSteps} steps. Optimization complete.`);
      }
    }
  }

  console.log(`\nOptimization finished after ${passNumber} passes`);
  console.log(`Final best score: ${bestScore}`);

  // Use the best roster found
  roster.forEach((staff, idx) => {
    staff.assignment = bestRoster[idx].assignment;
  });

  const uniqueLocationValidation = roster.every(({assignment}) => 
    countUniqueLocations(assignment) === weeklyLocationsRequired
  );

  const finalCounts = countStaffPerLocation(roster, days, locationList);
  const emptyLocations = validateRoster(finalCounts, days, locationList);

  return {
    days,
    roster,
    isValid: emptyLocations.length === 0 && uniqueLocationValidation,
    emptyLocations,
    impossibleDays: days.map(day => {
      const oofCount = Object.values(roster).filter(({assignment}, idx) => 
        assignment[idx] === 'OOF'  // Changed from WFH to OOF
      ).length;
      const availableStaff = roster.length - oofCount;
      return {
        day,
        possible: availableStaff >= locationList.length,
        availableStaff,
        requiredStaff: locationList.length
      };
    }).filter(d => !d.possible),
    message: generateMessage(uniqueLocationValidation, emptyLocations)
  };
}

function generateMessage(uniqueLocationValidation, emptyLocations) {
  if (!uniqueLocationValidation) {
    return "Error: Some staff members do not have the exact required number of unique locations";
  }
  if (emptyLocations.length > 0) {
    return `Warning: Unable to staff all locations. Empty slots: ${JSON.stringify(emptyLocations)}`;
  }
  return 'Success: All locations have at least one person assigned.';
}
