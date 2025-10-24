import { useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import { useApp } from '../context/AppContext';

const IncomePage = () => {
  const { filterIncome, getUniqueSources, getLast30DaysIncome } = useApp();
  const [filters, setFilters] = useState({});
  
  // Get all income and apply filters
  const allIncome = getLast30DaysIncome();
  const filteredIncome = filterIncome(filters);
  const sources = getUniqueSources();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSourceIcon = (source) => {
    const icons = {
      'Salary': '💼',
      'Freelance': '💻',
      'Investment Returns': '📈',
      'Bonus': '🎁',
      'Gift': '🎉',
      'Side Business': '🏪',
      'Other': '💰'
    };
    return icons[source] || '💰';
  };

  const getSourceColor = (source) => {
    const colors = {
      'Salary': 'bg-blue-100 text-blue-800',
      'Freelance': 'bg-purple-100 text-purple-800',
      'Investment Returns': 'bg-green-100 text-green-800',
      'Bonus': 'bg-yellow-100 text-yellow-800',
      'Gift': 'bg-pink-100 text-pink-800',
      'Side Business': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Income</h1>
        <p className="text-gray-600">Your income history for the last 30 days</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {Object.values(filters).some(v => v !== '') ? 'Filtered Income' : 'Total Income (30 days)'}
            </h2>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(filteredIncome.reduce((total, incomeItem) => total + incomeItem.amount, 0))}
            </p>
            {Object.values(filters).some(v => v !== '') && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredIncome.length} of {allIncome.length} income entries
              </p>
            )}
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        sources={sources}
        showCategoryFilter={false}
        showSourceFilter={true}
        showDateFilter={true}
        showAmountFilter={true}
        title="Filter Income"
      />

      {/* Income Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Income Details</h2>
        </div>
        
        {filteredIncome.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {Object.values(filters).some(v => v !== '') ? 'No income matches your filters' : 'No income found'}
            </h3>
            <p className="text-gray-500">
              {Object.values(filters).some(v => v !== '') 
                ? 'Try adjusting your filter criteria to see more results.' 
                : 'You haven\'t recorded any income in the last 30 days.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncome.map((incomeItem) => (
                  <tr key={incomeItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(incomeItem.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(incomeItem.source)}`}>
                        <span className="mr-1">{getSourceIcon(incomeItem.source)}</span>
                        {incomeItem.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                      +{formatCurrency(incomeItem.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;
