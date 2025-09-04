import moment from "moment";
import { LuArrowRight } from "react-icons/lu";
import TransctionInfoCard from "../Cards/TransctionInfoCard";

const dummyTransactions = [
  { id: 1, title: "Grocery Shopping", icon: null, date: "2025-08-30", amount: 150, type: "expense" },
  { id: 2, title: "Salary", icon: null, date: "2025-08-28", amount: 2500, type: "income" },
  { id: 3, title: "Dinner Out", icon: null, date: "2025-08-27", amount: 80, type: "expense" },
  { id: 4, title: "Freelance Project", icon: null, date: "2025-08-25", amount: 500, type: "income" },
  { id: 5, title: "Movie Night", icon: null, date: "2025-08-24", amount: 50, type: "expense" },
  { id: 6, title: "Gift Received", icon: null, date: "2025-08-23", amount: 200, type: "income" },
];

const RecentTransactions = ({ transactions = dummyTransactions, onSeeMore }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-semibold text-gray-700">Recent Transactions</h5>
        <button
          className="flex items-center text-blue-500 font-medium hover:text-blue-700 transition-colors"
          onClick={onSeeMore}
        >
          See More <LuArrowRight className="ml-1 w-5 h-5" />
        </button>
      </div>

      {/* Transaction List */}
      <div className="overflow-y-auto max-h-96 space-y-3">
        {transactions?.slice(0, 5).map((item) => (
          <TransctionInfoCard
            key={item.id}
            title={item.title   }
            icon={item.icon}
            date={moment(item.date).format("DD MMM, YYYY")}
            amount={item.amount}
            type={item.type}
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
