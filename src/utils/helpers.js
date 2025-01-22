export function countStaffPerLocation(roster, days, locationList, fixedLocation = '') {
  const dailyCounts = {};
  days.forEach(day => {
    dailyCounts[day] = {};
    locationList.forEach(loc => dailyCounts[day][loc] = 0);
    dailyCounts[day]['OOF'] = 0;  // Ensure OOF is initialized
  });

  roster.forEach(({assignment}) => {
    days.forEach((day, idx) => {
      if (assignment[idx] === fixedLocation) return;  // Skip fixed days
      dailyCounts[day][assignment[idx]]++;
    });
  });
  return dailyCounts;
}

export function countUniqueLocations(assignment) {
  return new Set(assignment.filter(loc => loc !== 'OOF' && loc !== 'X')).size;
}

export function validateRoster(counts, days, locationList) {
  const emptyLocations = [];
  days.forEach(day => {
    locationList.forEach(loc => {
      if (counts[day][loc] === 0) {
        emptyLocations.push({ day, location: loc });
      }
    });
  });
  return emptyLocations;
}

export function calculateLocationDistribution(assignment) {
  const locationCounts = {};
  assignment.forEach(loc => {
    if (loc !== 'OOF') {  // Changed from WFH to OOF
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }
  });
  
  const counts = Object.values(locationCounts);
  if (counts.length <= 1) return 0;
  
  const average = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length;
  return variance;
}

export function validateDailyDistribution(staffList, locationList, oofPreferences, day) {
  const availableStaff = staffList.length - 
    staffList.filter(staff => oofPreferences[staff]?.includes(day)).length;
  
  return {
    possible: availableStaff >= locationList.length,
    availableStaff,
    requiredStaff: locationList.length,
    shortfall: Math.max(0, locationList.length - availableStaff)
  };
}

export const haveInputsChanged = (oldInputs, newInputs) => {
  if (!oldInputs) return true;
  
  return (
    JSON.stringify(oldInputs.staffList) !== JSON.stringify(newInputs.staffList) ||
    JSON.stringify(oldInputs.locationList) !== JSON.stringify(newInputs.locationList) ||
    oldInputs.weeklyLocationsRequired !== newInputs.weeklyLocationsRequired ||
    JSON.stringify(oldInputs.oofPreferences) !== JSON.stringify(newInputs.oofPreferences) ||
    oldInputs.fixedDay !== newInputs.fixedDay ||
    oldInputs.fixedDayLocation !== newInputs.fixedDayLocation
  );
};
