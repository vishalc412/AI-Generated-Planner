import { api } from './api';
import { Plan, PlanCreateData, PlanUpdateData } from '@/types';

interface PlanListResponse {
  plans: Plan[];
  total: number;
  page: number;
  page_size: number;
}

export const planService = {
  async getPlans(params?: {
    skip?: number;
    limit?: number;
    plan_type?: string;
    is_completed?: boolean;
    priority?: string;
  }): Promise<PlanListResponse> {
    const response = await api.get<PlanListResponse>('/plans', { params });
    return response.data;
  },

  async getPlan(id: string): Promise<Plan> {
    const response = await api.get<Plan>(`/plans/${id}`);
    return response.data;
  },

  async createPlan(data: PlanCreateData): Promise<Plan> {
    const response = await api.post<Plan>('/plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: PlanUpdateData): Promise<Plan> {
    const response = await api.put<Plan>(`/plans/${id}`, data);
    return response.data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },

  async uploadImage(planId: string, file: File): Promise<Plan> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Plan>(`/plans/${planId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
