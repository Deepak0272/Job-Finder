import api from './api';

export const aiService = {
  matchJobs: async (options = {}) => {
    const response = await api.post('/ai/match-jobs', options);
    return response.data;
  },

  getSkillRecommendations: async (options = {}) => {
    const response = await api.post('/ai/skill-recommendations', options);
    return response.data;
  },

  analyzeResume: async (formData) => {
    const response = await api.post('/ai/analyze-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
