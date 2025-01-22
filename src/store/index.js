
import { configureStore } from '@reduxjs/toolkit';
import rosterReducer from './rosterSlice';

const store = configureStore({
  reducer: {
    roster: rosterReducer
  }
});

export default store;