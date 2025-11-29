import Notification from '../models/Notification.js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const getPercentage = (current, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
};

export const formatINR = (value = 0) => currencyFormatter.format(Math.max(0, value));

export const pushNotification = async ({ userId, type, title, message, data = {} }) => {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

const typeMap = {
  overall: {
    warning: 'budget_warning',
    critical: 'budget_critical',
    exceeded: 'budget_exceeded'
  },
  category: {
    warning: 'category_budget_warning',
    critical: 'category_budget_critical',
    exceeded: 'category_budget_exceeded'
  }
};

const buildTitle = (scope, level, category) => {
  const base = scope === 'category' && category ? `${category} budget` : 'Monthly budget';
  switch (level) {
    case 'warning':
      return `${base} warning`;
    case 'critical':
      return `${base} critical`;
    case 'exceeded':
      return `${base} exceeded`;
    default:
      return base;
  }
};

const buildMessage = (scope, level, { category, limit, current }) => {
  const percentage = getPercentage(current, limit);
  const baseLabel = scope === 'category' && category ? `${category} category` : 'overall spending';

  switch (level) {
    case 'warning':
      return `You have used ${percentage}% of your ${baseLabel} budget (${formatINR(limit)}).`;
    case 'critical':
      return `Critical alert: ${baseLabel} budget usage is at ${percentage}% (${formatINR(current)}).`;
    case 'exceeded':
      return `Budget exceeded: ${baseLabel} spending is now ${formatINR(current)}, above your limit of ${formatINR(limit)}.`;
    default:
      return `Budget update for ${baseLabel}.`;
  }
};

export const evaluateBudgetThresholds = async ({
  userId,
  scope = 'overall',
  category,
  limit,
  thresholds = { warning: 80, critical: 95 },
  previousValue = 0,
  currentValue = 0
}) => {
  if (!limit || limit <= 0) return null;
  if (currentValue <= previousValue) return null;

  const warningPoint = (limit * (thresholds.warning ?? 80)) / 100;
  const criticalPoint = (limit * (thresholds.critical ?? 95)) / 100;

  const transitions = [];
  if (previousValue < warningPoint && currentValue >= warningPoint) {
    transitions.push('warning');
  }
  if (previousValue < criticalPoint && currentValue >= criticalPoint) {
    transitions.push('critical');
  }
  if (previousValue <= limit && currentValue > limit) {
    transitions.push('exceeded');
  }

  if (!transitions.length) return null;

  const results = [];
  for (const level of transitions) {
    const type = typeMap[scope]?.[level];
    if (!type) continue;
    const title = buildTitle(scope, level, category);
    const message = buildMessage(scope, level, { category, limit, current: currentValue });

    const notification = await pushNotification({
      userId,
      type,
      title,
      message,
      data: {
        scope,
        category,
        limit,
        previousValue,
        currentValue,
        level
      }
    });
    if (notification) results.push(notification);
  }

  return results;
};

