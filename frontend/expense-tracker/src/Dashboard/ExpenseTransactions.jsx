import moment from "moment";
import { LuArrowRight } from "react-icons/lu";
import TransctionInfoCard from "../Cards/TransctionInfoCard";

export const dummyExpenses = [
  {id: 1,category: "Food & Dining",icon: null,date: "2025-09-01",amount: 1200,},
  {id: 2,category: "Transport",icon: null,date: "2025-08-28",amount: 450,},
  {id: 3,category: "Shopping",icon: null,date: "2025-08-25",amount: 2200,},
  {id: 4,category: "Health",icon: null,date: "2025-08-20",amount: 900,},
  {id: 5,category: "Entertainment",icon: null,date: "2025-08-15",amount: 750,},
  {id: 6,category: "Miscellaneous",icon: null,date: "2025-08-10",amount: 300,},
];

const ExpenseTransactions = ({ transactions = dummyExpenses, onSeeMore }) => {
    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-gray-700">Expenses</h5>
                <button
                    className="flex items-center text-blue-500 font-medium hover:text-blue-700 transition-colors"
                    onClick={onSeeMore}
                >
                    See More <LuArrowRight className="ml-1 w-5 h-5" />
                </button>
            </div>

            {/* Transaction List */}
            <div className="overflow-y-auto max-h-96 space-y-3">
                {transactions?.slice(0, 5).map((expense) => (
                    <TransctionInfoCard
                        key={expense.id}
                        title={expense.category}
                        icon={expense.icon}
                        date={moment(expense.date).format("DD MMM, YYYY")}
                        amount={expense.amount}
                        type="expense"
                        hideDeleteBtn
                    />
                ))}
            </div>
        </div>
   );
}

export default ExpenseTransactions
