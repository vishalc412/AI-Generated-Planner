export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum PlanType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum NotificationType {
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  PLAN_DUE_SOON = 'plan_due_soon',
  PLAN_OVERDUE = 'plan_overdue',
  TASK_COMPLETED = 'task_completed',
  PLAN_COMPLETED = 'plan_completed',
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  profile_picture?: string;
  auth_provider: 'google' | 'apple';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  notification_preferences: {
    email_notifications: boolean;
    in_app_notifications: boolean;
    notification_time_before: number;
  };
}

export interface ImageAttachment {
  url: string;
  filename: string;
  uploaded_at: string;
  size: number;
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  notes?: string;
  plan_type: PlanType;
  priority: PriorityLevel;
  target_date?: string;
  completed_date?: string;
  is_completed: boolean;
  images: ImageAttachment[];
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_task_count?: number;
}

export interface Task {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  target_date: string;
  completed_date?: string;
  is_completed: boolean;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_task_id?: string;
  related_plan_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface TaskSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  high_priority_tasks: number;
  medium_priority_tasks: number;
  low_priority_tasks: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PlanCreateData {
  title: string;
  description?: string;
  notes?: string;
  plan_type: PlanType;
  priority: PriorityLevel;
  target_date?: string;
}

export interface PlanUpdateData {
  title?: string;
  description?: string;
  notes?: string;
  plan_type?: PlanType;
  priority?: PriorityLevel;
  target_date?: string;
  is_completed?: boolean;
}

export interface TaskCreateData {
  plan_id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  target_date: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  target_date?: string;
  is_completed?: boolean;
}
