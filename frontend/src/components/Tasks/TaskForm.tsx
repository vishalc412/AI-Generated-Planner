import React, { useState, useEffect } from 'react';
import { taskService } from '@/services/task.service';
import { planService } from '@/services/plan.service';
import { Task, Plan, PriorityLevel, TaskCreateData } from '@/types';
import { toast } from 'react-toastify';

interface TaskFormProps {
  task?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState<TaskCreateData>({
    plan_id: '',
    title: '',
    description: '',
    priority: PriorityLevel.MEDIUM,
    target_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
    if (task) {
      setFormData({
        plan_id: task.plan_id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        target_date: task.target_date,
      });
    }
  }, [task]);

  const loadPlans = async () => {
    try {
      const data = await planService.getPlans({ is_completed: false });
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (task) {
        const { plan_id, ...updateData } = formData;
        await taskService.updateTask(task.id, updateData);
        toast.success('Task updated successfully');
      } else {
        await taskService.createTask(formData);
        toast.success('Task created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${task ? 'update' : 'create'} task`);
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {task ? 'Edit Task' : 'Create Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan *
            </label>
            <select
              value={formData.plan_id}
              onChange={(e) =>
                setFormData({ ...formData, plan_id: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              required
              disabled={!!task}
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as PriorityLevel,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value={PriorityLevel.LOW}>Low</option>
                <option value={PriorityLevel.MEDIUM}>Medium</option>
                <option value={PriorityLevel.HIGH}>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date *
              </label>
              <input
                type="datetime-local"
                value={
                  formData.target_date
                    ? new Date(formData.target_date).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : '',
                  })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
