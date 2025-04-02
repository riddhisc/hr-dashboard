import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import applicantsReducer from './slices/applicantsSlice'
import interviewsReducer from './slices/interviewsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applicants: applicantsReducer,
    interviews: interviewsReducer
  }
})

export default store 