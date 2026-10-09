import { AUTH_API_CLIENT } from './apiClient';

export const fetchTasksApi = async () => {
  const response = await AUTH_API_CLIENT.get('/tasks/company');
  return response.data;
};

export const fetchTaskByIdApi = async (id: string) => {
  const response = await AUTH_API_CLIENT.get(`/tasks/${id}`);
  return response.data;
};

export const submitTaskApi = async (taskId: string, link: string) => {
  const response = await AUTH_API_CLIENT.post('/submissions/create', {
    taskId,
    link,
  });
  return response.data;
};

export const createCampaignApi = async (formData: FormData) => {
  const response = await AUTH_API_CLIENT.post('/tasks/company/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchSubmissionsByTaskApi = async (taskId: string) => {
  const response = await AUTH_API_CLIENT.get(`/submissions/company/task/${taskId}`);
  return response.data;
};

export const approveSubmissionApi = async (submissionId: string) => {
  const response = await AUTH_API_CLIENT.patch(`/submissions/company/approve/${submissionId}`);
  return response.data;
};

export const rejectSubmissionApi = async (submissionId: string, reason?: string) => {
  const response = await AUTH_API_CLIENT.patch(`/submissions/company/reject/${submissionId}`, { reason });
  return response.data;
};

export const activateTaskApi = async (taskId: string | number, paymentReference: string) => {
  const response = await AUTH_API_CLIENT.post('/tasks/company/activate', {
    taskId: String(taskId),
    paymentReference: String(paymentReference)
  });
  return response.data;
};

export const deleteCampaignApi = async (taskId: string) => {
  const response = await AUTH_API_CLIENT.delete(`/tasks/${taskId}`);
  return response.data;
};

export const updateCampaignApi = async (taskId: string, formData: FormData) => {
  const response = await AUTH_API_CLIENT.patch(`/tasks/${taskId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteSubmissionApi = async (submissionId: string) => {
  const response = await AUTH_API_CLIENT.delete(`/submissions/company/${submissionId}`);
  return response.data;
};
