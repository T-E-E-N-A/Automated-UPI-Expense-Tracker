import { IoMdCard } from 'react-icons/io';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../../Cards/InfoCard';
import DashBoardLayout from '../../components/layouts/DashBoardLayout';
import ExpenseTransactions from '../../Dashboard/ExpenseTransactions';
import FinanceOverview from '../../Dashboard/FinanceOverview';
import Last30DaysExpenses from '../../Dashboard/last30DaysExpenses';
import RecentTransactions from '../../Dashboard/RecentTransactions';
import { addThousandsSeparator } from '../../utils/helper';


const Home = () => {
  const navigate = useNavigate();

  const dashboardData = {
    totalBalance: 12000,
    totalincome: 8000,
    totalExpense: 4000,
    RecentTransactions: [
      { id: 1, title: "Grocery Shopping", icon: null, date: "2025-08-30", amount: 150, type: "expense" },
      { id: 2, title: "Salary", icon: null, date: "2025-08-28", amount: 2500, type: "income" },
      { id: 3, title: "Dinner Out", icon: null, date: "2025-08-27", amount: 80, type: "expense" },
      { id: 4, title: "Freelance Project", icon: null, date: "2025-08-25", amount: 500, type: "income" },
      { id: 5, title: "Movie Night", icon: null, date: "2025-08-24", amount: 50, type: "expense" },
    ],
    last30DaysExpenses: [
    { id: 6, title: "Transport", icon: null, date: "2025-08-20", amount: 200, type: "expense" },
    { id: 7, title: "Health Checkup", icon: null, date: "2025-08-15", amount: 700, type: "expense" },
    { id: 8, title: "Online Shopping", icon: null, date: "2025-08-10", amount: 1200, type: "expense" },
    { id: 9, title: "Snacks", icon: null, date: "2025-08-05", amount: 100, type: "expense" },
  ],
  };

  return (
    <DashBoardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto w-full max-w-4xl space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard className="text-blue-500 text-3xl" />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData.totalBalance)}
          />
          <InfoCard
            icon={<LuWalletMinimal className="text-blue-500 text-3xl" />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData.totalincome)}
          />
          <InfoCard
            icon={<LuHandCoins className="text-blue-500 text-3xl" />}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData.totalExpense)}
          />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={dashboardData.RecentTransactions}
          onSeeMore={() => navigate("/expense")}
        /> 

        {/* Finance Overview */}
         <FinanceOverview
          totalBalance={dashboardData.totalBalance}
          totalIncome={dashboardData.totalincome}
          totalExpense={dashboardData.totalExpense}
        />  
        <ExpenseTransactions
        transactions={dashboardData.last30DaysExpenses}
        onSeeMore={() => navigate("/expense")}
         />
         <Last30DaysExpenses
        transactions={dashboardData.last30DaysExpenses}
        onSeeMore={() => navigate("/expense")}
         />
      </div>
    </DashBoardLayout>
  );
};

export default Home;
