import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { secureStorage } from '@/lib/secureStorage';
import type { SessionUser } from '@/lib/types';

const SESSION_KEY = 'rehabx.session';

export interface AuthState {
  status: 'restoring' | 'signedOut' | 'signedIn';
  token: string | null;
  user: SessionUser | null;
}

const initialState: AuthState = { status: 'restoring', token: null, user: null };

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const raw = await secureStorage.get(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; user: SessionUser };
  } catch {
    return null;
  }
});

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (session: { token: string; user: SessionUser }) => {
    await secureStorage.set(SESSION_KEY, JSON.stringify(session));
    return session;
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await secureStorage.remove(SESSION_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Used when the API rejects the token (expired) — clears state immediately. */
    sessionExpired(state) {
      state.status = 'signedOut';
      state.token = null;
      state.user = null;
      void secureStorage.remove(SESSION_KEY);
    },
  },
  extraReducers: (builder) => {
    const apply = (
      state: AuthState,
      action: PayloadAction<{ token: string; user: SessionUser } | null>,
    ) => {
      state.token = action.payload?.token ?? null;
      state.user = action.payload?.user ?? null;
      state.status = action.payload ? 'signedIn' : 'signedOut';
    };
    builder
      .addCase(restoreSession.fulfilled, apply)
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'signedOut';
      })
      .addCase(signIn.fulfilled, apply)
      .addCase(signOut.fulfilled, (state) => apply(state, { type: 'auth/signOut', payload: null }));
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
