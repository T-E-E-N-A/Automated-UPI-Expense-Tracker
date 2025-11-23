const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      // For Clerk integration, we'll use a different approach
      // The backend will identify users by Clerk ID from the request
    };
  }

  // Generic request method
  async request(endpoint, options = {}, clerkUser = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Normalize method
    const method = (options.method || 'GET').toUpperCase();

    // Prepare headers
    const headers = { ...this.getAuthHeaders(), ...(options.headers || {}) };

    // For GET/HEAD, don't send a body. Attach Clerk info via headers.
    // For other methods, merge Clerk info into JSON body.
    let body = options.body;
    if (clerkUser) {
      const clerkId = clerkUser.id;
      const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress;
      if (method === 'GET' || method === 'HEAD') {
        headers['X-Clerk-Id'] = clerkId;
        if (clerkEmail) headers['X-Clerk-Email'] = clerkEmail;
      } else {
        const existing = body ? JSON.parse(body) : {};
        body = JSON.stringify({
          ...existing,
          clerkId,
          clerkEmail
        });
      }
    }

    const config = {
      ...options,
      method,
      headers,
      ...(body && { body })
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async createUser(userData) {
    return this.request('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getUserProfile() {
    return this.request('/auth/me');
  }

  // Expense endpoints
  async getExpenses(params = {}, user = null) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/expenses${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.expenses || [];
  }

  async addExpense(expenseData, user = null) {
    const res = await this.request('/expenses/add', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    }, user);
    return res.expense || res;
  }

  async updateExpense(id, expenseData, user = null) {
    const res = await this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    }, user);
    return res.expense || res;
  }

  async deleteExpense(id, user = null) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE'
    }, user);
  }

  // Income endpoints
  async getIncome(params = {}, user = null) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/income${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.income || [];
  }

  async addIncome(incomeData, user = null) {
    const res = await this.request('/income/add', {
      method: 'POST',
      body: JSON.stringify(incomeData)
    }, user);
    return res.income || res;
  }

  async updateIncome(id, incomeData, user = null) {
    const res = await this.request(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incomeData)
    }, user);
    return res.income || res;
  }

  async deleteIncome(id, user = null) {
    return this.request(`/income/${id}`, {
      method: 'DELETE'
    }, user);
  }

  // Dashboard endpoints
  async getDashboardData(user = null) {
    const res = await this.request('/dashboard/summary', {}, user);
    return res.summary || res;
  }

  async getExpenseCategories(user = null, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/dashboard/expenses/categories${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.data || res;
  }

  async getIncomeSources(user = null, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/dashboard/income/sources${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.data || res;
  }

  // Reports endpoints
  async getExpenseReport(user = null, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/reports/category${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.data || res;
  }

  async getIncomeReport(user = null, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await this.request(`/reports/income/source${queryString ? `?${queryString}` : ''}`, {}, user);
    return res.data || res;
  }

  // Notifications endpoints
  async getNotifications(user = null) {
    const res = await this.request('/notifications/alerts', {}, user);
    return res;
  }

  // Profile endpoints (Clerk-backed)
  async getProfile(user = null) {
    const res = await this.request('/auth/me', {}, user);
    return res.user || res;
  }

  async updateProfile(profileData, user = null) {
    const res = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }, user);
    return res.user || res;
  }

  // ML endpoints
  async categorizeExpense(text, merchant = null, user = null) {
    const res = await this.request('/ml/categorize', {
      method: 'POST',
      body: JSON.stringify({ text, merchant, type: 'expense' })
    }, user);
    return res;
  }

  async categorizeIncome(text, source = null, user = null) {
    const res = await this.request('/ml/categorize', {
      method: 'POST',
      body: JSON.stringify({ text, merchant: source, type: 'income' })
    }, user);
    return res;
  }

  async getMLInsights(user = null) {
    const res = await this.request('/ml/insights', {}, user);
    return res;
  }

  async getMLPrediction(timeframe = 'month', user = null) {
    const res = await this.request('/ml/predict', {
      method: 'POST',
      body: JSON.stringify({ timeframe })
    }, user);
    return res;
  }

  // Download report methods
  async downloadExpensesReport(params = {}, user = null) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/reports/download/expenses${queryString ? `?${queryString}` : ''}`;
    
    const headers = { ...this.getAuthHeaders() };
    if (user) {
      headers['X-Clerk-Id'] = user.id;
      if (user.primaryEmailAddress?.emailAddress) {
        headers['X-Clerk-Email'] = user.primaryEmailAddress.emailAddress;
      }
    }
    delete headers['Content-Type']; // Let browser set content type for download

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async downloadIncomeReport(params = {}, user = null) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/reports/download/income${queryString ? `?${queryString}` : ''}`;
    
    const headers = { ...this.getAuthHeaders() };
    if (user) {
      headers['X-Clerk-Id'] = user.id;
      if (user.primaryEmailAddress?.emailAddress) {
        headers['X-Clerk-Email'] = user.primaryEmailAddress.emailAddress;
      }
    }
    delete headers['Content-Type']; // Let browser set content type for download

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `income-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async downloadCombinedReport(params = {}, user = null) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/reports/download/combined${queryString ? `?${queryString}` : ''}`;
    
    const headers = { ...this.getAuthHeaders() };
    if (user) {
      headers['X-Clerk-Id'] = user.id;
      if (user.primaryEmailAddress?.emailAddress) {
        headers['X-Clerk-Email'] = user.primaryEmailAddress.emailAddress;
      }
    }
    delete headers['Content-Type']; // Let browser set content type for download

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `combined-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export default new ApiService();
