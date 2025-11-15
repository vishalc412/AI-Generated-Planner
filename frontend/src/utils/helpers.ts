import { format, isPast, formatDistanceToNow } from 'date-fns';
import { PriorityLevel } from '@/types';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const isOverdue = (date: string | Date): boolean => {
  return isPast(new Date(date));
};

export const timeUntil = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getPriorityColor = (priority: PriorityLevel): string => {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'text-red-600 bg-red-100 border-red-300';
    case PriorityLevel.MEDIUM:
      return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    case PriorityLevel.LOW:
      return 'text-green-600 bg-green-100 border-green-300';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

export const getPriorityBadgeColor = (priority: PriorityLevel): string => {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'bg-red-500 text-white';
    case PriorityLevel.MEDIUM:
      return 'bg-yellow-500 text-white';
    case PriorityLevel.LOW:
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export const getOverdueColor = (): string => {
  return 'text-red-600 bg-red-50 border-red-400';
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
