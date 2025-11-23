/**
 * SMS Parser Utility for Bank Messages
 * Extracts amount, merchant, date, and transaction type from bank SMS messages
 */

// Common bank SMS patterns
const SMS_PATTERNS = {
  // Debit patterns
  DEBIT: [
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:debited|spent|paid|transferred)/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:debited|spent|paid|transferred)/i,
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*from\s*A\/c/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*from\s*A\/c/i
  ],
  
  // Credit patterns
  CREDIT: [
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:credited|received|deposited|transferred\s+to)/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:credited|received|deposited|transferred\s+to)/i,
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*to\s*A\/c/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*to\s*A\/c/i,
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*has\s+been\s+credited/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*has\s+been\s+credited/i,
    /Rs\.?(\d+(?:,\d+)*(?:\.\d+)?)\s*received\s+from/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*received\s+from/i
  ],
  
  // UPI patterns
  UPI: [
    /UPI\/(\d+)\/([^\/\s]+)/i,
    /UPI\/([^\/\s]+)\/(\d+)/i,
    /UPI\/([^\/\s]+)/i
  ],
  
  // Date patterns
  DATE: [
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{2,4})/i
  ],
  
  // Time patterns
  TIME: [
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
    /(\d{1,2}:\d{2})/
  ],
  
  // Merchant patterns
  MERCHANT: [
    /to\s+([^\/\s]+)/i,
    /at\s+([^\/\s]+)/i,
    /from\s+([^\/\s]+)/i,
    /UPI\/([^\/\s]+)/i,
    /PAYTM|SWIGGY|ZOMATO|AMAZON|FLIPKART|UBER|OLA|NETFLIX|SPOTIFY/i,
    /received\s+from\s+([^\/\s]+)/i,
    /credited\s+from\s+([^\/\s]+)/i,
    /deposited\s+by\s+([^\/\s]+)/i
  ]
};

// Common merchant mappings
const MERCHANT_MAPPINGS = {
  'PAYTM': 'Paytm',
  'SWIGGY': 'Swiggy',
  'ZOMATO': 'Zomato',
  'AMAZON': 'Amazon',
  'FLIPKART': 'Flipkart',
  'UBER': 'Uber',
  'OLA': 'Ola',
  'NETFLIX': 'Netflix',
  'SPOTIFY': 'Spotify'
};

/**
 * Parse SMS message to extract transaction details
 * @param {string} smsText - The SMS message text
 * @returns {Object} Parsed transaction data
 */
export function parseSMS(smsText) {
  if (!smsText || typeof smsText !== 'string') {
    return { error: 'Invalid SMS text' };
  }

  const text = smsText.trim();
  const result = {
    amount: null,
    merchant: null,
    date: null,
    time: null,
    type: null, // 'debit' or 'credit'
    rawText: text,
    confidence: 0
  };

  let confidence = 0;

  // Extract amount
  const amount = extractAmount(text);
  if (amount) {
    result.amount = amount;
    confidence += 0.4;
  }

  // Determine transaction type and extract amount if not found
  const transactionType = determineTransactionType(text);
  result.type = transactionType;
  if (transactionType && !result.amount) {
    const typeAmount = extractAmountByType(text, transactionType);
    if (typeAmount) {
      result.amount = typeAmount;
      confidence += 0.3;
    }
  }

  // Extract merchant
  const merchant = extractMerchant(text);
  if (merchant) {
    result.merchant = merchant;
    confidence += 0.2;
  }

  // Extract date
  const date = extractDate(text);
  if (date) {
    result.date = date;
    confidence += 0.1;
  }

  // Extract time
  const time = extractTime(text);
  if (time) {
    result.time = time;
    confidence += 0.05;
  }

  result.confidence = Math.min(confidence, 1);

  return result;
}

/**
 * Extract amount from SMS text
 */
function extractAmount(text) {
  for (const pattern of SMS_PATTERNS.DEBIT.concat(SMS_PATTERNS.CREDIT)) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

/**
 * Extract amount by transaction type
 */
function extractAmountByType(text, type) {
  const patterns = type === 'debit' ? SMS_PATTERNS.DEBIT : SMS_PATTERNS.CREDIT;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

/**
 * Determine transaction type (debit/credit)
 */
function determineTransactionType(text) {
  const lowerText = text.toLowerCase();
  
  // Check for debit indicators
  if (lowerText.includes('debited') || lowerText.includes('spent') || 
      lowerText.includes('paid') || lowerText.includes('transferred from') ||
      lowerText.includes('withdrawn') || lowerText.includes('deducted')) {
    return 'debit';
  }
  
  // Check for credit indicators
  if (lowerText.includes('credited') || lowerText.includes('received') || 
      lowerText.includes('deposited') || lowerText.includes('transferred to') ||
      lowerText.includes('salary') || lowerText.includes('bonus') ||
      lowerText.includes('refund') || lowerText.includes('cashback') ||
      lowerText.includes('interest') || lowerText.includes('dividend')) {
    return 'credit';
  }
  
  // Check for UPI patterns - need to be more specific
  if (lowerText.includes('upi')) {
    // If it mentions "received" or "credited" in UPI context, it's credit
    if (lowerText.includes('received') || lowerText.includes('credited')) {
      return 'credit';
    }
    // Otherwise, most UPI transactions are debits
    return 'debit';
  }
  
  return null;
}

/**
 * Extract merchant name from SMS text
 */
function extractMerchant(text) {
  // Check for common merchant names first
  for (const [key, value] of Object.entries(MERCHANT_MAPPINGS)) {
    if (text.toUpperCase().includes(key)) {
      return value;
    }
  }

  // Try UPI patterns
  for (const pattern of SMS_PATTERNS.UPI) {
    const match = text.match(pattern);
    if (match && match[1] && !match[1].match(/^\d+$/)) {
      return match[1].toUpperCase();
    }
  }

  // Try other merchant patterns
  for (const pattern of SMS_PATTERNS.MERCHANT) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const merchant = match[1].trim();
      if (merchant.length > 2 && merchant.length < 50) {
        return merchant;
      }
    }
  }

  return null;
}

/**
 * Extract date from SMS text
 */
function extractDate(text) {
  for (const pattern of SMS_PATTERNS.DATE) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  // If no date found, use current date
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract time from SMS text
 */
function extractTime(text) {
  for (const pattern of SMS_PATTERNS.TIME) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Validate parsed SMS data
 */
export function validateParsedSMS(parsedData) {
  const errors = [];
  
  if (!parsedData.amount || parsedData.amount <= 0) {
    errors.push('Amount not found or invalid');
  }
  
  if (!parsedData.type) {
    errors.push('Transaction type not determined');
  }
  
  if (parsedData.confidence < 0.3) {
    errors.push('Low confidence in parsing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format parsed data for expense/income creation
 */
export function formatForTransaction(parsedData) {
  if (!parsedData.amount || !parsedData.type) {
    return null;
  }

  const baseData = {
    amount: parsedData.amount,
    date: parsedData.date || new Date().toISOString().split('T')[0],
    description: parsedData.rawText.substring(0, 100) // Limit description length
  };

  if (parsedData.type === 'debit') {
    return {
      ...baseData,
      category: 'Other', // Will be updated by ML categorization
      merchant: parsedData.merchant || 'Unknown',
      type: 'expense'
    };
  } else {
    return {
      ...baseData,
      source: parsedData.merchant || 'Unknown',
      type: 'income'
    };
  }
}
