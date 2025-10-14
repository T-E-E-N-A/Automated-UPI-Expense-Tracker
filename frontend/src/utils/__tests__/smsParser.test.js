/**
 * Test file for SMS Parser utility
 * This demonstrates how the SMS parsing works with various bank message formats
 */

import { formatForTransaction, parseSMS, validateParsedSMS } from '../smsParser';

// Test SMS messages in different formats
const testSMSMessages = [
  {
    name: 'UPI Debit - Paytm',
    message: 'Rs.500.00 debited from A/c **1234 on 15-Dec-23 at 2:30 PM. UPI/123456789012/PAYTM/UPI. Avl Bal Rs.15,000.00',
    expectedType: 'debit',
    expectedAmount: 500
  },
  {
    name: 'UPI Debit - Swiggy',
    message: 'Rs.250.50 debited from A/c **5678 on 16-Dec-23 at 7:45 PM. UPI/987654321098/SWIGGY/UPI. Avl Bal Rs.8,500.00',
    expectedType: 'debit',
    expectedAmount: 250.50
  },
  {
    name: 'Credit Transaction',
    message: 'Rs.10,000.00 credited to A/c **1234 on 15-Dec-23 at 9:00 AM. Salary credit. Avl Bal Rs.25,000.00',
    expectedType: 'credit',
    expectedAmount: 10000
  },
  {
    name: 'ATM Withdrawal',
    message: 'Rs.2,000.00 debited from A/c **1234 on 15-Dec-23 at 3:15 PM. ATM withdrawal at SBI ATM. Avl Bal Rs.13,000.00',
    expectedType: 'debit',
    expectedAmount: 2000
  },
  {
    name: 'Online Purchase - Amazon',
    message: 'Rs.1,250.00 debited from A/c **1234 on 15-Dec-23 at 11:30 AM. Online purchase at AMAZON. Avl Bal Rs.11,750.00',
    expectedType: 'debit',
    expectedAmount: 1250
  }
];

// Test the SMS parsing functionality
export function testSMSParsing() {
  console.log('🧪 Testing SMS Parser...\n');
  
  testSMSMessages.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`SMS: ${testCase.message}`);
    
    const parsed = parseSMS(testCase.message);
    const validation = validateParsedSMS(parsed);
    const transactionData = formatForTransaction(parsed);
    
    console.log('Parsed Data:', {
      amount: parsed.amount,
      type: parsed.type,
      merchant: parsed.merchant,
      date: parsed.date,
      confidence: parsed.confidence
    });
    
    console.log('Validation:', validation);
    console.log('Transaction Data:', transactionData);
    
    // Check if parsing was successful
    const isAmountCorrect = parsed.amount === testCase.expectedAmount;
    const isTypeCorrect = parsed.type === testCase.expectedType;
    
    console.log(`✅ Amount correct: ${isAmountCorrect} (expected: ${testCase.expectedAmount}, got: ${parsed.amount})`);
    console.log(`✅ Type correct: ${isTypeCorrect} (expected: ${testCase.expectedType}, got: ${parsed.type})`);
    console.log(`✅ Validation passed: ${validation.isValid}`);
    console.log('---\n');
  });
}

// Test edge cases
export function testEdgeCases() {
  console.log('🧪 Testing Edge Cases...\n');
  
  const edgeCases = [
    {
      name: 'Empty message',
      message: '',
      shouldFail: true
    },
    {
      name: 'Invalid format',
      message: 'This is not a bank SMS',
      shouldFail: true
    },
    {
      name: 'Partial amount',
      message: 'Rs.500 debited from account',
      shouldFail: false
    }
  ];
  
  edgeCases.forEach((testCase, index) => {
    console.log(`Edge Case ${index + 1}: ${testCase.name}`);
    console.log(`SMS: "${testCase.message}"`);
    
    const parsed = parseSMS(testCase.message);
    const validation = validateParsedSMS(parsed);
    
    console.log('Parsed Data:', parsed);
    console.log('Validation:', validation);
    console.log(`Expected to fail: ${testCase.shouldFail}, Actually failed: ${!validation.isValid}`);
    console.log('---\n');
  });
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testSMSParsing();
  testEdgeCases();
}

