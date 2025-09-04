// Helper function to validate email format
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email)
    }
    

// Helper function to add thousands separator to numbers
export const addThousandsSeparator = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

import moment from "moment";

export const prepareExpenseBarChartData = (data = []) => {
  return data.map(item => ({
    label: moment(item.date).format("MMM DD"), // e.g., "Aug 20"
    value: Number(item.amount) || 0,
  }));
};
