import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import isEqual from 'lodash.isequal'; // Updated import

const FIXED_DOC_ID = 'b71';

const excludeLastUpdated = (data) => {
  const { lastUpdated, ...rest } = data;
  // console.log('Excluded lastUpdated field, returning:', rest); // Commented out
  return rest;
};

const hasDataChanged = (newData, oldData) => {
  if (!oldData) return true;
  const keys = Object.keys(newData);
  for (const key of keys) {
    if (!isEqual(newData[key], oldData[key])) { // Updated usage
      // console.log(`Data changed for key: ${key}`); // Commented out
      // console.log('New data:', newData[key]); // Commented out
      // console.log('Old data:', oldData[key]); // Commented out
      return true;
    }
  }
  return false;
};

export const saveRosterData = async (data) => {
  if (!auth.currentUser) {
    console.error('Save attempted without auth');
    return;
  }
  try {
    // console.log('Starting save operation for document:', FIXED_DOC_ID); // Commented out
    await setDoc(doc(db, 'rosters', FIXED_DOC_ID), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    // console.log('Save completed successfully'); // Commented out
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

export const loadRosterData = async (initializeIfMissing = true) => {
  if (!auth.currentUser) {
    console.warn('Load attempted without auth');
    return null;
  }
  try {
    // console.log('Starting load operation'); // Commented out
    const docRef = doc(db, 'rosters', FIXED_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() && initializeIfMissing) {
      // console.log('Document does not exist, initializing with empty state'); // Commented out
      const emptyState = {
        staffList: [],
        locationList: [],
        weeklyLocationsRequired: 0,
        oofPreferences: {},
        fixedDay: '',
        fixedDayLocation: '',
        roster: null,
        days: null,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(docRef, emptyState);
      return emptyState;
    }
    
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const subscribeToRosterData = (callback, previousDataRef) => {
  const docRef = doc(db, 'rosters', FIXED_DOC_ID);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const newData = excludeLastUpdated(doc.data());
      if (hasDataChanged(newData, previousDataRef.current)) {
       
        previousDataRef.current = newData;
        callback(newData);
      }
    }
  }, (error) => {
    console.error('Error listening to roster updates:', error);
  });
};
