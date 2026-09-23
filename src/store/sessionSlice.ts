import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Live state of the guided exercise session (the AI / 3D coach screen). */
export interface ExerciseSessionState {
  programExerciseId: string | null;
  running: boolean;
  reps: number;
  elapsedSec: number;
  cue: string | null;
  showSkeleton: boolean;
}

const initialState: ExerciseSessionState = {
  programExerciseId: null,
  running: false,
  reps: 0,
  elapsedSec: 0,
  cue: null,
  showSkeleton: true,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<string>) {
      Object.assign(state, initialState, {
        programExerciseId: action.payload,
        running: true,
        showSkeleton: state.showSkeleton,
      });
    },
    sessionToggled(state) {
      state.running = !state.running;
    },
    sessionTicked(state, action: PayloadAction<number>) {
      state.elapsedSec += action.payload;
    },
    repCounted(state, action: PayloadAction<number>) {
      if (action.payload > state.reps) state.reps = action.payload;
    },
    cueChanged(state, action: PayloadAction<string>) {
      if (state.cue !== action.payload) state.cue = action.payload;
    },
    skeletonToggled(state) {
      state.showSkeleton = !state.showSkeleton;
    },
    sessionEnded(state) {
      state.running = false;
    },
  },
});

export const {
  sessionStarted,
  sessionToggled,
  sessionTicked,
  repCounted,
  cueChanged,
  skeletonToggled,
  sessionEnded,
} = sessionSlice.actions;
export default sessionSlice.reducer;
