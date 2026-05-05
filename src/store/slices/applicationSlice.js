import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applicationService } from '../../api/services';

export const fetchMyApplications = createAsyncThunk('applications/fetchMyApplications', async () => {
  const response = await applicationService.getMyApplications();
  return response.data;
});

export const applyToJob = createAsyncThunk('applications/applyToJob', async (applicationData) => {
  const response = await applicationService.apply(applicationData);
  return response.data;
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
      });
  },
});

export default applicationSlice.reducer;
