import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { Task, PriorityLevel } from '@/types';
import { formatDate, getPriorityBadgeColor, getOverdueColor } from '@/utils/helpers';
import Navbar from '@/components/Layout/Navbar';
import TaskForm from '@/components/Tasks/TaskForm';
import { toast } from 'react-toastify';

const Tasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<{
    is_completed?: boolean;
    priority?: PriorityLevel;
    is_overdue?: boolean;
  }>({
    is_overdue: searchParams.get('overdue') === 'true',
  });

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks(filter);
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully');
      loadTasks();
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskService.updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      toast.success(
        task.is_completed ? 'Task marked as incomplete' : 'Task completed!'
      );
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Failed to update task:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedTask(null);
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <button
            onClick={handleCreateTask}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <select
              value={
                filter.is_overdue === undefined
                  ? ''
                  : filter.is_overdue
                  ? 'true'
                  : 'false'
              }
              onChange={(e) =>
                setFilter({
                  ...filter,
                  is_overdue:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'true',
                })
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Overdue Only</option>
              <option value="false">Not Overdue</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Create your first task!
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  task.is_overdue && !task.is_completed
                    ? getOverdueColor()
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleComplete(task)}
                      className="w-5 h-5 text-primary-600 mt-1"
                    />
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold ${
                          task.is_completed
                            ? 'line-through text-gray-500'
                            : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-sm text-gray-600">
                          Due: {formatDate(task.target_date)}
                        </span>
                        {task.is_overdue && !task.is_completed && (
                          <span className="text-sm text-red-600 font-semibold">
                            (Overdue)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            task={selectedTask}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks;
