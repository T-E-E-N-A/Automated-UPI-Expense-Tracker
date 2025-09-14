import CustomPiechart from '../Charts/CustomPiechart';
import { addThousandsSeparator } from '../utils/helper';

const FinanceOverview = ({totalBalance,totalIncome,totalExpense}) => {
    const data = [
  {
    name: "Total Balance",
    amount: totalBalance,
    color: "#3B82F6", 
  },
  {
    name: "Total Income",
    amount: totalIncome,
    color: "#10B981",
  },
  {
    name: "Total Expense",
    amount: totalExpense,
    color: "#EF4444", 
  },
];
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-lg mx-auto">
  <CustomPiechart
    data={data}
    label="Finance Overview"
    totalAmount={`Total: $${addThousandsSeparator(totalBalance)}`}

    color="#3B82F6" 
    showTextAnchor
  />
</div>

  )
}

export default FinanceOverview
