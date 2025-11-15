import React, { useState, useEffect } from 'react';
import { planService } from '@/services/plan.service';
import { Plan, PlanType, PriorityLevel, PlanCreateData } from '@/types';
import { toast } from 'react-toastify';

interface PlanFormProps {
  plan?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PlanCreateData>({
    title: '',
    description: '',
    notes: '',
    plan_type: PlanType.DAILY,
    priority: PriorityLevel.MEDIUM,
    target_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        title: plan.title,
        description: plan.description || '',
        notes: plan.notes || '',
        plan_type: plan.plan_type,
        priority: plan.priority,
        target_date: plan.target_date || '',
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (plan) {
        await planService.updatePlan(plan.id, formData);
        toast.success('Plan updated successfully');
      } else {
        await planService.createPlan(formData);
        toast.success('Plan created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${plan ? 'update' : 'create'} plan`);
      console.error('Failed to save plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {plan ? 'Edit Plan' : 'Create Plan'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              rows={5}
              placeholder="Rich text notes similar to Keynote..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Type *
              </label>
              <select
                value={formData.plan_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plan_type: e.target.value as PlanType,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value={PlanType.DAILY}>Daily</option>
                <option value={PlanType.WEEKLY}>Weekly</option>
                <option value={PlanType.MONTHLY}>Monthly</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
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
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : plan ? 'Update' : 'Create'}
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

export default PlanForm;
