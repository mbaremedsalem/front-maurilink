import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../../api/services';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (params) => {
  const response = await jobService.getAll(params);
  return response.data;
});

export const fetchJobById = createAsyncThunk('jobs/fetchJobById', async (id) => {
  const response = await jobService.getById(id);
  return response.data;
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData) => {
  const response = await jobService.create(jobData);
  return response.data;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.results || action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      });
  },
});

export const { clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
