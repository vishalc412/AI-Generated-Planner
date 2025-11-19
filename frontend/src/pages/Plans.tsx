import React, { useEffect, useState } from 'react';
import { planService } from '@/services/plan.service';
import { Plan, PlanType, PriorityLevel } from '@/types';
import { formatDate, getPriorityBadgeColor, getOverdueColor, isOverdue } from '@/utils/helpers';
import Navbar from '@/components/Layout/Navbar';
import PlanForm from '@/components/Plans/PlanForm';
import { toast } from 'react-toastify';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<{
    plan_type?: PlanType;
    is_completed?: boolean;
    priority?: PriorityLevel;
  }>({});

  useEffect(() => {
    loadPlans();
  }, [filter]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await planService.getPlans(filter);
      setPlans(data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await planService.deletePlan(id);
      toast.success('Plan deleted successfully');
      loadPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
      console.error('Failed to delete plan:', error);
    }
  };

  const handleToggleComplete = async (plan: Plan) => {
    try {
      await planService.updatePlan(plan.id, {
        is_completed: !plan.is_completed,
      });
      toast.success(
        plan.is_completed ? 'Plan marked as incomplete' : 'Plan completed!'
      );
      loadPlans();
    } catch (error) {
      toast.error('Failed to update plan');
      console.error('Failed to update plan:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPlan(null);
    loadPlans();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plans</h1>
          <button
            onClick={handleCreatePlan}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Create Plan
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filter.plan_type || ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  plan_type: e.target.value as PlanType | undefined,
                })
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value={PlanType.DAILY}>Daily</option>
              <option value={PlanType.WEEKLY}>Weekly</option>
              <option value={PlanType.MONTHLY}>Monthly</option>
            </select>

            <select
              value={filter.priority || ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  priority: e.target.value as PriorityLevel | undefined,
                })
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Priorities</option>
              <option value={PriorityLevel.HIGH}>High</option>
              <option value={PriorityLevel.MEDIUM}>Medium</option>
              <option value={PriorityLevel.LOW}>Low</option>
            </select>

            <select
              value={
                filter.is_completed === undefined
                  ? ''
                  : filter.is_completed
                  ? 'true'
                  : 'false'
              }
              onChange={(e) =>
                setFilter({
                  ...filter,
                  is_completed:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'true',
                })
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Completed</option>
            </select>
          </div>
        </div>

        {/* Plans List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No plans found. Create your first plan!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const overdueStatus =
                plan.target_date &&
                !plan.is_completed &&
                isOverdue(plan.target_date);

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                    overdueStatus ? 'border-2 border-red-400' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold flex-1">
                      {plan.title}
                    </h3>
                    <input
                      type="checkbox"
                      checked={plan.is_completed}
                      onChange={() => handleToggleComplete(plan)}
                      className="w-5 h-5 text-primary-600"
                    />
                  </div>

                  {plan.description && (
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(
                          plan.priority
                        )}`}
                      >
                        {plan.priority}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {plan.plan_type}
                      </span>
                    </div>

                    {plan.target_date && (
                      <p
                        className={`text-sm ${
                          overdueStatus ? 'text-red-600 font-semibold' : 'text-gray-600'
                        }`}
                      >
                        Due: {formatDate(plan.target_date)}
                        {overdueStatus && ' (Overdue)'}
                      </p>
                    )}

                    <p className="text-sm text-gray-600">
                      Tasks: {plan.completed_task_count || 0} /{' '}
                      {plan.task_count || 0}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Plan Form Modal */}
        {showForm && (
          <PlanForm
            plan={selectedPlan}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Plans;
