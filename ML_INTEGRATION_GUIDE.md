# ML Integration Guide

This guide explains how the ML model integration works with the SMS input box in the dashboard.

## Overview

The ML integration allows users to paste bank SMS messages into the dashboard, which are then automatically parsed and categorized using machine learning. The system extracts transaction details and suggests categories for expenses.

## Components

### 1. SMS Parser (`frontend/src/utils/smsParser.js`)

The SMS parser utility extracts key information from bank SMS messages:

- **Amount**: Extracts transaction amounts using regex patterns
- **Transaction Type**: Determines if it's a debit or credit
- **Merchant**: Identifies the merchant or source
- **Date**: Extracts transaction date
- **Time**: Extracts transaction time
- **Confidence**: Calculates parsing confidence score

#### Supported SMS Formats

The parser supports various bank SMS formats:

```
Rs.500.00 debited from A/c **1234 on 15-Dec-23 at 2:30 PM. UPI/123456789012/PAYTM/UPI. Avl Bal Rs.15,000.00
```

```
Rs.10,000.00 credited to A/c **1234 on 15-Dec-23 at 9:00 AM. Salary credit. Avl Bal Rs.25,000.00
```

### 2. ML API Integration (`frontend/src/services/api.js`)

Added ML-specific API methods:

- `categorizeExpense(text, merchant, user)` - Categorizes expenses using ML
- `getMLInsights(user)` - Gets AI-powered spending insights
- `getMLPrediction(timeframe, user)` - Gets spending predictions

### 3. App Context Integration (`frontend/src/context/AppContext.jsx`)

Extended the app context with ML processing capabilities:

- `processSMSMessage(smsText)` - Processes SMS and returns ML results
- `createTransactionFromML(mlResult, userConfirmation)` - Creates transaction from ML result
- `clearMLResult()` - Clears ML processing results

### 4. Dashboard Integration (`frontend/src/components/Dashboard.jsx`)

Updated the dashboard to integrate ML processing:

- Enhanced SMS input box with processing states
- Error handling and display
- Integration with ML confirmation modal

### 5. ML Confirmation Modal (`frontend/src/components/MLConfirmationModal.jsx`)

A comprehensive modal that shows:

- Original SMS message
- Parsed transaction details
- ML categorization suggestions
- User confirmation form
- Confidence scores

## How It Works

### Step 1: SMS Input
User pastes a bank SMS message into the dashboard input box.

### Step 2: SMS Parsing
The SMS parser extracts:
- Transaction amount
- Transaction type (debit/credit)
- Merchant/source
- Date and time
- Confidence score

### Step 3: ML Categorization
For expense transactions, the system calls the ML API to:
- Categorize the expense (Food & Dining, Transportation, etc.)
- Provide confidence scores
- Suggest alternative categories

### Step 4: User Confirmation
The ML confirmation modal displays:
- Parsed information
- ML categorization suggestions
- Editable form fields
- Confidence indicators

### Step 5: Transaction Creation
User confirms or modifies the details, and the transaction is created.

## Backend Integration

The backend ML routes (`backend/routes/ml.js`) handle:

- **Categorization**: `/api/ml/categorize` - Categorizes expense text
- **Predictions**: `/api/ml/predict` - Provides spending forecasts
- **Insights**: `/api/ml/insights` - Generates AI insights

### Fallback Handling

The system includes robust fallback mechanisms:

1. **ML Service Unavailable**: Falls back to keyword-based categorization
2. **Parsing Failures**: Shows clear error messages
3. **Low Confidence**: Allows user to override suggestions

## Testing

### Manual Testing

1. Start the backend server
2. Start the frontend development server
3. Navigate to the dashboard
4. Paste a sample bank SMS message
5. Click "Process Message"
6. Review the ML confirmation modal
7. Confirm or modify the transaction details

### Sample SMS Messages for Testing

```
Rs.500.00 debited from A/c **1234 on 15-Dec-23 at 2:30 PM. UPI/123456789012/PAYTM/UPI. Avl Bal Rs.15,000.00
```

```
Rs.250.50 debited from A/c **5678 on 16-Dec-23 at 7:45 PM. UPI/987654321098/SWIGGY/UPI. Avl Bal Rs.8,500.00
```

```
Rs.10,000.00 credited to A/c **1234 on 15-Dec-23 at 9:00 AM. Salary credit. Avl Bal Rs.25,000.00
```

## Configuration

### Environment Variables

Ensure these environment variables are set:

```bash
# Backend
ML_SERVICE_URL=http://localhost:8000  # ML service URL
ML_API_KEY=your_ml_api_key            # ML service API key

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### ML Service Setup

The ML service should be running on the configured URL and should have the following endpoints:

- `POST /categorize` - Categorize expense text
- `POST /predict` - Get spending predictions
- `GET /insights` - Get AI insights

## Error Handling

The system handles various error scenarios:

1. **Invalid SMS Format**: Shows parsing error with suggestions
2. **ML Service Down**: Falls back to keyword-based categorization
3. **Network Issues**: Shows retry options
4. **Low Confidence**: Allows user to override suggestions

## Future Enhancements

Potential improvements:

1. **Multi-language Support**: Support for different languages
2. **Merchant Recognition**: Better merchant identification
3. **Pattern Learning**: Learn from user corrections
4. **Batch Processing**: Process multiple SMS messages
5. **Advanced Analytics**: More sophisticated insights

## Troubleshooting

### Common Issues

1. **SMS Not Parsed**: Check if the SMS format is supported
2. **ML Categorization Failed**: Verify ML service is running
3. **Low Confidence**: Review the SMS format and try again
4. **Transaction Not Created**: Check backend logs for errors

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'ml-integration');
```

This will show detailed logs in the browser console.

