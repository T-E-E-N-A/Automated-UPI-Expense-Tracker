import { useEffect, useState } from "react";
import CustomBarchart from "../Charts/CustomBarchart";
import { prepareExpenseBarChartData } from "../utils/helper";

const Last30DaysExpenses = ({ transactions }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (transactions) {
        // console.log(transactions);
      const result = prepareExpenseBarChartData(transactions);
      setChartData(result);
    }
  }, [transactions]);

  return (
    <div>
      <div>
        <h5 className="text-lg font-semibold text-gray-700 mb-3">
          Last 30 Days Expense
        </h5>
      </div>
      <CustomBarchart data={chartData} />
    </div>
  );
};

export default Last30DaysExpenses;
