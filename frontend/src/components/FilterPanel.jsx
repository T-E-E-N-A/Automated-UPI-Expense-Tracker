import { useState } from 'react';
import apiService from '../services/api';
import { useUser } from '@clerk/clerk-react';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  categories = [], 
  sources = [], 
  showCategoryFilter = true,
  showSourceFilter = true,
  showDateFilter = true,
  showAmountFilter = true,
  title = "Filters",
  reportType = 'both' // 'expenses', 'income', or 'both'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { user } = useUser();

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      source: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  const buildDownloadParams = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.category) params.category = filters.category;
    if (filters.source) params.source = filters.source;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    return params;
  };

  const handleDownloadExpenses = async () => {
    if (!user) return;
    try {
      setDownloading(true);
      await apiService.downloadExpensesReport(buildDownloadParams(), user);
    } catch (error) {
      console.error('Failed to download expenses report:', error);
      alert('Failed to download expenses report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadIncome = async () => {
    if (!user) return;
    try {
      setDownloading(true);
      await apiService.downloadIncomeReport(buildDownloadParams(), user);
    } catch (error) {
      console.error('Failed to download income report:', error);
      alert('Failed to download income report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCombined = async () => {
    if (!user) return;
    try {
      setDownloading(true);
      await apiService.downloadCombinedReport(buildDownloadParams(), user);
    } catch (error) {
      console.error('Failed to download combined report:', error);
      alert('Failed to download combined report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            {/* Download Report Buttons */}
            <div className="flex items-center space-x-2 mr-4 flex-wrap gap-2">
              {(reportType === 'expenses' || reportType === 'both') && (
                <button
                  onClick={handleDownloadExpenses}
                  disabled={downloading}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  title="Download Expenses Report"
                >
                  <span>📥</span>
                  <span className="hidden sm:inline">Expenses</span>
                  <span className="sm:hidden">Exp</span>
                </button>
              )}
              {(reportType === 'income' || reportType === 'both') && (
                <button
                  onClick={handleDownloadIncome}
                  disabled={downloading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  title="Download Income Report"
                >
                  <span>📥</span>
                  <span className="hidden sm:inline">Income</span>
                  <span className="sm:hidden">Inc</span>
                </button>
              )}
              {reportType === 'both' && (
                <button
                  onClick={handleDownloadCombined}
                  disabled={downloading}
                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  title="Download Combined Report"
                >
                  <span>📥</span>
                  <span className="hidden sm:inline">Combined</span>
                  <span className="sm:hidden">All</span>
                </button>
              )}
              {downloading && (
                <span className="text-sm text-gray-500">Downloading...</span>
              )}
            </div>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Source Filter */}
            {showSourceFilter && sources.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Amount Range Filter */}
            {showAmountFilter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="No limit"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                handleFilterChange('startDate', last7Days.toISOString().split('T')[0]);
                handleFilterChange('endDate', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                handleFilterChange('startDate', last30Days.toISOString().split('T')[0]);
                handleFilterChange('endDate', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                handleFilterChange('startDate', last90Days.toISOString().split('T')[0]);
                handleFilterChange('endDate', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Last 90 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                handleFilterChange('startDate', thisMonth.toISOString().split('T')[0]);
                handleFilterChange('endDate', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
