import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from '../firebase/config';
import { loginAnonymously } from '../services/auth';
import { saveRosterData, loadRosterData, subscribeToRosterData } from '../services/firestore';
import {
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
} from '../store/rosterSlice';
import isEqual from 'lodash.isequal'; // Add this line

const isEmptyState = (state) => {
  return !state.staffList?.length && 
         !state.locationList?.length && 
         !state.weeklyLocationsRequired &&
         !Object.keys(state.oofPreferences || {}).length &&
         !state.fixedDay &&
         !state.fixedDayLocation &&
         !state.cachedRoster &&
         !state.cachedDays;
};

export const useRosterState = () => {
  const dispatch = useDispatch();
  const isFirestoreUpdate = useRef(false);
  const previousStateRef = useRef(null);
  const previousDataRef = useRef(null); // Add this line
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isInitialMount = useRef(true);
  const isLoading = useRef(true);
  const [savingStatus, setSavingStatus] = useState('Synced');

  const state = useSelector(state => state.roster);

  // Update the updateStateFromData function to batch updates
  const updateStateFromData = (data) => {
    // Batch all updates together to prevent multiple saves
    const updates = {
      staffList: data.staffList || [],
      locationList: data.locationList || [],
      weeklyLocationsRequired: data.weeklyLocationsRequired || 0,
      oofPreferences: data.oofPreferences || {},
      fixedDay: data.fixedDay || '',
      fixedDayLocation: data.fixedDayLocation || '',
      cachedRoster: data.roster || null,
      cachedDays: data.days || null,
      cachedInputs: {
        staffList: data.staffList || [],
        locationList: data.locationList || [],
        weeklyLocationsRequired: data.weeklyLocationsRequired || 0,
        oofPreferences: data.oofPreferences || {},
        fixedDay: data.fixedDay || '',
        fixedDayLocation: data.fixedDayLocation || ''
      }
    };

    // Dispatch all updates at once
    Object.entries(updates).forEach(([key, value]) => {
      const actionCreator = {
        staffList: setStaffList,
        locationList: setLocationList,
        weeklyLocationsRequired: setWeeklyLocationsRequired,
        oofPreferences: setOofPreferences,
        fixedDay: setFixedDay,
        fixedDayLocation: setFixedDayLocation,
        cachedRoster: setCachedRoster,
        cachedDays: setCachedDays,
        cachedInputs: setCachedInputs
      }[key];
      
      if (actionCreator) {
        dispatch(actionCreator(value));
      }
    });

    // Set previousStateRef.current to the loaded data to prevent save trigger
    previousStateRef.current = {
      staffList: data.staffList || [],
      locationList: data.locationList || [],
      weeklyLocationsRequired: data.weeklyLocationsRequired || 0,
      oofPreferences: data.oofPreferences || {},
      fixedDay: data.fixedDay || '',
      fixedDayLocation: data.fixedDayLocation || '',
      roster: data.roster || null,
      days: data.days || null
    };
  };

  // Add loading state tracking
  useEffect(() => {
    //console.log('Initial loading state:', { loading, isAuthenticated });
  }, [loading, isAuthenticated]);

  // Initialize auth with listener
  useEffect(() => {
    //console.log('Starting authentication process...');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user found, attempting anonymous login...');
          setLoading(true);
          await loginAnonymously();
        } else {
          console.log('User authenticated');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        console.error('Auth error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        dispatch(setError('Failed to initialize authentication'));
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        //console.log('Authentication process completed');
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Update data loading effect
  useEffect(() => {
    if (!isAuthenticated) {
      //console.log('Waiting for authentication before loading data...');
      return;
    }

    const loadAllData = async () => {
      //console.log('Starting data load process...');
      isLoading.current = true;
      try {
        const savedData = await loadRosterData(true); // Pass true to initialize if missing
        if (savedData) {
          isFirestoreUpdate.current = true;
          updateStateFromData(savedData);
          isFirestoreUpdate.current = false;
        //   console.log('Data loaded or initialized:', {
        //     isNew: Object.keys(savedData).every(key => 
        //       Array.isArray(savedData[key]) ? savedData[key].length === 0 : !savedData[key]
        //     )
        //   });
        }
      } catch (error) {
        console.error('Data loading error:', error);
        dispatch(setError('Failed to load saved data'));
      } finally {
        isInitialMount.current = false;
        isLoading.current = false;
        //console.log('Data loading process completed');
      }
    };

    loadAllData();
    
    //console.log('Setting up real-time data subscription...');
    const unsubscribe = subscribeToRosterData((data) => {
    //   console.log('Received real-time update:', {
    //     hasData: !!data,
    //     timestamp: new Date().toISOString()
    //   });
      if (data) {
        isFirestoreUpdate.current = true;
        updateStateFromData(data);
        isFirestoreUpdate.current = false;
      }
    }, previousDataRef); // Pass previousDataRef

    return () => {
      //console.log('Cleaning up data subscription');
      unsubscribe?.();
    };
  }, [isAuthenticated, dispatch]);

  // Update the save effect to check loading state
  useEffect(() => {
    if (!isAuthenticated || isFirestoreUpdate.current || isLoading.current) {
    //   console.log('Skipping save:', {
    //     isAuthenticated,
    //     isFirestoreUpdate: isFirestoreUpdate.current,
    //     isLoading: isLoading.current
    //   });
      return;
    }

    const currentState = {
      staffList: state.staffList,
      locationList: state.locationList,
      weeklyLocationsRequired: state.weeklyLocationsRequired,
      oofPreferences: state.oofPreferences,
      fixedDay: state.fixedDay,
      fixedDayLocation: state.fixedDayLocation,
      roster: state.cachedRoster,
      days: state.cachedDays
    };

    // Only skip save if state is empty AND it's the initial mount
    if (isEmptyState(currentState) && isInitialMount.current) {
      return;
    }

    const hasChanged = !previousStateRef.current || 
      !isEqual(currentState, previousStateRef.current); // Updated line

    if (hasChanged) {
      //console.log('State changed, initiating save...');
      setSavingStatus('Saving'); // Add this line
      saveRosterData(currentState)
        .then(() => {
          //console.log('Save successful');
          previousStateRef.current = currentState;
          setSavingStatus('Saved'); // Add this line
        })
        .catch(err => {
          console.error('Save failed:', {
            error: err,
            stack: err.stack,
            state: JSON.stringify(currentState).slice(0, 200) + '...' // Log truncated state for debugging
          });
          dispatch(setError('Failed to save changes'));
          setSavingStatus('Failed to Save'); // Add this line
        });
    }
  }, [state, isAuthenticated, dispatch]);

  // Action creators
  const actions = {
    addStaff: (name) => {
      if (state.staffList.includes(name)) {
        dispatch(setError('This staff member already exists'));
        return false;
      }
      dispatch(setStaffList([...state.staffList, name]));
      dispatch(setOofPreferences({
        ...state.oofPreferences,
        [name]: []
      }));
      dispatch(setError(''));
      return true;
    },

    removeStaff: (staffToRemove) => {
      dispatch(setStaffList(state.staffList.filter(staff => staff !== staffToRemove)));
      const { [staffToRemove]: removed, ...remainingPreferences } = state.oofPreferences;
      dispatch(setOofPreferences(remainingPreferences));
    },

    renameStaff: (oldName, newName) => {
      if (state.staffList.includes(newName)) {
        dispatch(setError('This staff name already exists'));
        return false;
      }
      dispatch(setStaffList(state.staffList.map(name => name === oldName ? newName : name)));
      dispatch(setOofPreferences(prev => {
        const updated = {};
        for (const key in prev) {
          updated[key === oldName ? newName : key] = prev[key];
        }
        return updated;
      }));
      return true;
    },

    toggleOofDay: (staff, day) => {
      const currentDays = state.oofPreferences[staff] || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      dispatch(setOofPreferences({
        ...state.oofPreferences,
        [staff]: newDays
      }));
    },

    setWeeklyLocationsRequired: (val) => {
      dispatch(setWeeklyLocationsRequired(val));
    },

    setFixedDay: (day) => {
      dispatch(setFixedDay(day));
    },

    setFixedDayLocation: (location) => {
      dispatch(setFixedDayLocation(location));
    },

    addLocation: (name) => {
      if (state.locationList.includes(name)) {
        dispatch(setError('This location already exists'));
        return false;
      }
      dispatch(setLocationList([...state.locationList, name]));
      dispatch(setError(''));
      return true;
    },

    removeLocation: (locationToRemove) => {
      dispatch(setLocationList(state.locationList.filter(loc => loc !== locationToRemove)));
    },

    renameLocation: (oldLoc, newLoc) => {
      if (state.locationList.includes(newLoc)) {
        dispatch(setError('This location already exists'));
        return false;
      }
      dispatch(setLocationList(state.locationList.map(loc => loc === oldLoc ? newLoc : loc)));
      return true;
    },

    updateRoster: (roster, days) => {
      dispatch(setCachedRoster(roster));
      dispatch(setCachedDays(days));
      dispatch(setCachedInputs({
        staffList: state.staffList,
        locationList: state.locationList,
        weeklyLocationsRequired: state.weeklyLocationsRequired,
        oofPreferences: state.oofPreferences,
        fixedDay: state.fixedDay,
        fixedDayLocation: state.fixedDayLocation
      }));
    },

    setError: (error) => {
      dispatch(setError(error));
    }
  };

  return {
    state,
    actions,
    isAuthenticated,
    loading: isLoading.current, // Update this line
    isFirestoreUpdate: isFirestoreUpdate.current,  // Add this line
    savingStatus // Add this line
  };
};
