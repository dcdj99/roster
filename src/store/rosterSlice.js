
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staffList: [],
  locationList: [],
  weeklyLocationsRequired: 0,
  oofPreferences: {},
  fixedDay: '',
  fixedDayLocation: '',
  cachedRoster: null,
  cachedDays: null,
  cachedInputs: null,
  error: ''
};

export const rosterSlice = createSlice({
  name: 'roster',
  initialState,
  reducers: {
    setStaffList: (state, action) => { state.staffList = action.payload; },
    setLocationList: (state, action) => { state.locationList = action.payload; },
    setWeeklyLocationsRequired: (state, action) => { state.weeklyLocationsRequired = action.payload; },
    setOofPreferences: (state, action) => { state.oofPreferences = action.payload; },
    setFixedDay: (state, action) => { state.fixedDay = action.payload; },
    setFixedDayLocation: (state, action) => { state.fixedDayLocation = action.payload; },
    setCachedRoster: (state, action) => { state.cachedRoster = action.payload; },
    setCachedDays: (state, action) => { state.cachedDays = action.payload; },
    setCachedInputs: (state, action) => { state.cachedInputs = action.payload; },
    setError: (state, action) => { state.error = action.payload; }
  }
});

export const {
  setStaffList,
  setLocationList,
  setWeeklyLocationsRequired,
  setOofPreferences,
  setFixedDay,
  setFixedDayLocation,
  setCachedRoster,
  setCachedDays,
  setCachedInputs,
  setError
} = rosterSlice.actions;

export default rosterSlice.reducer;