import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resumeService } from '../../api/services';

export const fetchResumes = createAsyncThunk('resumes/fetchResumes', async () => {
  const response = await resumeService.getAll();
  return response.data;
});

export const createResume = createAsyncThunk('resumes/createResume', async (resumeData) => {
  const response = await resumeService.create(resumeData);
  return response.data;
});

export const updateResume = createAsyncThunk('resumes/updateResume', async ({ id, data }) => {
  const response = await resumeService.update(id, data);
  return response.data;
});

const resumeSlice = createSlice({
  name: 'resumes',
  initialState: {
    resumes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = action.payload;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createResume.fulfilled, (state, action) => {
        state.resumes.push(action.payload);
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        const index = state.resumes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resumes[index] = action.payload;
        }
      });
  },
});

export default resumeSlice.reducer;
