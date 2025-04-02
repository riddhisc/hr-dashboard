import { configureStore } from '@reduxjs/toolkit'
import jobsReducer from '../features/jobs/jobsSlice'
import applicantsReducer from '../features/applicants/applicantsSlice'
import interviewsReducer from '../features/interviews/interviewsSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    applicants: applicantsReducer,
    interviews: interviewsReducer,
    auth: authReducer,
  },
})

// Export for use in components
export const getState = store.getState
export const dispatch = store.dispatch 