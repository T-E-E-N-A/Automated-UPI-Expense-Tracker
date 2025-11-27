import { useUser } from '@clerk/clerk-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Education',
  'Travel',
  'Insurance',
  'Other'
];

const BudgetSettings = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [budget, setBudget] = useState(null);
  const [form, setForm] = useState({
    monthlyLimit: '',
    warningThreshold: 80,
    criticalThreshold: 95,
    categoryLimits: {}
  });

  const loadBudget = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getBudget(user);
      setBudget(data);
      setForm({
        monthlyLimit: data?.monthlyLimit ?? '',
        warningThreshold: data?.alertThresholds?.warning ?? 80,
        criticalThreshold: data?.alertThresholds?.critical ?? 95,
        categoryLimits: (data?.categoryBudgets || []).reduce((acc, entry) => {
          acc[entry.category] = entry.limit;
          return acc;
        }, {})
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load budget settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [user]);

  const categoryProgress = useMemo(() => {
    if (!budget?.categoryBudgets) return {};
    return budget.categoryBudgets.reduce((acc, entry) => {
      acc[entry.category] = {
        spent: entry.currentMonthSpent,
        limit: entry.limit,
        percentage: entry.limit > 0 ? Math.min(100, Math.round((entry.currentMonthSpent / entry.limit) * 100)) : 0
      };
      return acc;
    }, {});
  }, [budget]);

  const onCategoryLimitChange = (category, value) => {
    setForm(prev => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [category]: value ? Number(value) : ''
      }
    }));
  };

  const onSaveBudget = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const categoryBudgets = Object.entries(form.categoryLimits)
      .filter(([, limit]) => limit && Number(limit) > 0)
      .map(([category, limit]) => ({
        category,
        limit: Number(limit)
      }));

    try {
      setSaving(true);
      const updated = await api.updateBudget({
        monthlyLimit: Number(form.monthlyLimit) || 0,
        alertThresholds: {
          warning: Number(form.warningThreshold) || 80,
          critical: Number(form.criticalThreshold) || 95
        },
        categoryBudgets
      }, user);

      setBudget(updated);
      setForm(prev => ({
        ...prev,
        monthlyLimit: updated?.monthlyLimit ?? prev.monthlyLimit,
        warningThreshold: updated?.alertThresholds?.warning ?? prev.warningThreshold,
        criticalThreshold: updated?.alertThresholds?.critical ?? prev.criticalThreshold,
        categoryLimits: (updated?.categoryBudgets || []).reduce((acc, entry) => {
          acc[entry.category] = entry.limit;
          return acc;
        }, {})
      }));
      setSuccess('Budget settings saved');
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="text-gray-600">Loading budget settings...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Budget Settings</h2>
          <p className="text-sm text-gray-500">Set an overall limit and optional per-category budgets.</p>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

      <form onSubmit={onSaveBudget} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (₹)</label>
            <input
              type="number"
              min="0"
              value={form.monthlyLimit}
              onChange={(e) => setForm(prev => ({ ...prev, monthlyLimit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warning Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.warningThreshold}
              onChange={(e) => setForm(prev => ({ ...prev, warningThreshold: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Critical Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.criticalThreshold}
              onChange={(e) => setForm(prev => ({ ...prev, criticalThreshold: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Category Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultCategories.map(category => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={form.categoryLimits[category] ?? ''}
                  onChange={(e) => onCategoryLimitChange(category, e.target.value)}
                  placeholder="Set limit (₹)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {categoryProgress[category] && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Spent: ₹{categoryProgress[category].spent.toFixed(0)}</span>
                      <span>{categoryProgress[category].percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${categoryProgress[category].percentage >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${categoryProgress[category].percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetSettings;

