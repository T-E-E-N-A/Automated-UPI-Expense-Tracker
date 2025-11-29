import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Expense validation rules
export const validateExpense = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('category')
    .isIn([
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
    ])
    .withMessage('Invalid category'),
  
  body('merchant')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Merchant name must be between 1 and 100 characters'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999999 })
    .withMessage('Amount must be between 0.01 and 999,999,999'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['UPI', 'Card', 'Cash', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Income validation rules
export const validateIncome = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('source')
    .isIn([
      'Salary',
      'Freelance',
      'Investment Returns',
      'Bonus',
      'Gift',
      'Side Business',
      'Rental Income',
      'Dividends',
      'Interest',
      'Other'
    ])
    .withMessage('Invalid income source'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999999 })
    .withMessage('Amount must be between 0.01 and 999,999,999'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Budget validation rules
export const validateBudget = [
  body('monthlyLimit')
    .isFloat({ min: 0, max: 999999999 })
    .withMessage('Monthly limit must be between 0 and 999,999,999'),
  
  body('alertThresholds.warning')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Warning threshold must be between 0 and 100'),
  
  body('alertThresholds.critical')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Critical threshold must be between 0 and 100'),

  body('categoryBudgets')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Category budgets must be an array'),

  body('categoryBudgets.*.category')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),

  body('categoryBudgets.*.limit')
    .optional()
    .isFloat({ min: 0, max: 999999999 })
    .withMessage('Category limit must be between 0 and 999,999,999'),

  body('categoryBudgets.*.alertThresholds.warning')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Category warning threshold must be between 0 and 100'),

  body('categoryBudgets.*.alertThresholds.critical')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Category critical threshold must be between 0 and 100'),
  
  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

// ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];
