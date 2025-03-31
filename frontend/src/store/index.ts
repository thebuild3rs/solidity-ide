import { configureStore } from '@reduxjs/toolkit';
import fileSystemReducer from './slices/fileSystemSlice';
import projectReducer from './slices/projectSlice';
import ethereumReducer from './slices/ethereumSlice';

export const store = configureStore({
  reducer: {
    fileSystem: fileSystemReducer,
    project: projectReducer,
    ethereum: ethereumReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 