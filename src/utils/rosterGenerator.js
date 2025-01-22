import { balanceLocations } from './balancer';

export function generateRoster(
  staffList,
  locationList,
  weeklyLocationsRequired,
  oofPreferences,
  fixedDay = '',
  fixedDayLocation = ''
) {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const workingDays = allDays.filter(day => day !== fixedDay);
  const fixedDayIndex = fixedDay ? allDays.indexOf(fixedDay) : -1;

  // Filter OOF preferences to exclude fixed day
  const filteredOofPreferences = {};
  Object.entries(oofPreferences).forEach(([staff, days]) => {
    filteredOofPreferences[staff] = days.filter(day => day !== fixedDay);
  });

  // Generate initial roster without fixed day
  const initialRoster = generateInitialRoster(
    staffList,
    locationList,
    weeklyLocationsRequired,
    filteredOofPreferences,
    workingDays
  );

  // Balance locations excluding fixed day
  const balancedResult = balanceLocations(
    { days: workingDays, roster: initialRoster.roster },
    locationList,
    weeklyLocationsRequired
  );

  // If there's a fixed day, add it back to the assignments
  if (fixedDay && balancedResult.roster.length > 0) {
    balancedResult.days = [...allDays]; // Use spread to create new array
    balancedResult.roster.forEach(staff => {
      const newAssignment = [...staff.assignment];
      const isOofOnFixedDay = oofPreferences[staff.staff]?.includes(fixedDay);
      newAssignment.splice(fixedDayIndex, 0, isOofOnFixedDay ? 'OOF' : fixedDayLocation);
      staff.assignment = newAssignment;
    });
  }

  return balancedResult;
}

function generateInitialRoster(
  staffList,
  locationList,
  weeklyLocationsRequired,
  oofPreferences,
  days
) {
  const roster = staffList.map((staff, staffIndex) => {
    const assignment = [];
    const usedLocations = new Set();
    const oofDays = oofPreferences[staff] || [];
    
    // Introduce a random offset
    const randomOffset = Math.floor(Math.random() * locationList.length);

    // Select required number of unique locations
    const selectedLocations = [];
    for (let i = 0; i < weeklyLocationsRequired && i < locationList.length; i++) {
      const location = locationList[(randomOffset + staffIndex + i) % locationList.length];
      if (!usedLocations.has(location)) {
        selectedLocations.push(location);
        usedLocations.add(location);
      }
    }

    // Calculate days available for location assignment
    const workDays = days.length - oofDays.length;
    const daysPerLocation = Math.floor(workDays / selectedLocations.length);
    const extraDays = workDays % selectedLocations.length;

    // Distribute locations across available days
    let dayIndex = 0;
    days.forEach(day => {
      if (oofDays.includes(day)) {
        assignment.push('OOF');
      } else {
        const locationIndex = Math.floor(dayIndex / (daysPerLocation + (dayIndex < extraDays ? 1 : 0)));
        assignment.push(selectedLocations[Math.min(locationIndex, selectedLocations.length - 1)]);
        dayIndex++;
      }
    });
    
    return { staff, assignment };
  });
  return { days, roster };
}
