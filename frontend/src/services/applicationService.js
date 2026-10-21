import api from './api';

export const applicationService = {
  getApplications: async (status) => {
    const params = status && status !== 'All' ? { status } : {};
    const response = await api.get('/applications', { params });
    return response.data;
  },

  createApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  updateApplication: async (id, updateData) => {
    const response = await api.put(`/applications/${id}`, updateData);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};
