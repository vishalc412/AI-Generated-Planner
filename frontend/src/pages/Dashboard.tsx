import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { planService } from '@/services/plan.service';
import { TaskSummary, Plan, Task, PriorityLevel } from '@/types';
import { formatDate, getPriorityBadgeColor, getOverdueColor } from '@/utils/helpers';
import Navbar from '@/components/Layout/Navbar';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [recentPlans, setRecentPlans] = useState<Plan[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, plansData, tasksData] = await Promise.all([
        taskService.getSummary(),
        planService.getPlans({ limit: 5, is_completed: false }),
        taskService.getTasks({ limit: 10, is_overdue: true }),
      ]);

      setSummary(summaryData);
      setRecentPlans(plansData.plans);
      setOverdueTasks(tasksData.tasks);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {summary?.total_tasks || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {summary?.completed_tasks || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {summary?.pending_tasks || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Overdue</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {summary?.overdue_tasks || 0}
            </p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tasks by Priority</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {summary?.high_priority_tasks || 0}
              </p>
              <p className="text-gray-600 text-sm">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {summary?.medium_priority_tasks || 0}
              </p>
              <p className="text-gray-600 text-sm">Medium Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {summary?.low_priority_tasks || 0}
              </p>
              <p className="text-gray-600 text-sm">Low Priority</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Plans */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Plans</h2>
              <Link
                to="/plans"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentPlans.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No plans yet</p>
              ) : (
                recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(
                              plan.priority
                            )}`}
                          >
                            {plan.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {plan.task_count || 0} tasks
                          </span>
                        </div>
                      </div>
                      {plan.target_date && (
                        <span className="text-sm text-gray-500">
                          {formatDate(plan.target_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Overdue Tasks</h2>
              <Link
                to="/tasks?overdue=true"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {overdueTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No overdue tasks
                </p>
              ) : (
                overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 ${getOverdueColor()}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm mt-1">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm">
                        {formatDate(task.target_date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
