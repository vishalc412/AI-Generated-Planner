import { api } from './api';
import { Task, TaskCreateData, TaskUpdateData, TaskSummary } from '@/types';

interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export const taskService = {
  async getTasks(params?: {
    skip?: number;
    limit?: number;
    plan_id?: string;
    is_completed?: boolean;
    priority?: string;
    is_overdue?: boolean;
  }): Promise<TaskListResponse> {
    const response = await api.get<TaskListResponse>('/tasks', { params });
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: TaskCreateData): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: TaskUpdateData): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getSummary(): Promise<TaskSummary> {
    const response = await api.get<TaskSummary>('/tasks/summary');
    return response.data;
  },
};
