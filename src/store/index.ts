import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { configureApi } from '@/lib/api';
import authReducer, { sessionExpired } from './authSlice';
import sessionReducer from './sessionSlice';

export const store = configureStore({
  reducer: { auth: authReducer, session: sessionReducer },
});

configureApi({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(sessionExpired()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
