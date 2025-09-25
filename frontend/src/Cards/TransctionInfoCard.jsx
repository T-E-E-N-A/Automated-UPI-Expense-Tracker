import { LuTrash2, LuTrendingDown, LuTrendingUp, LuUtensils } from "react-icons/lu";

const TransctionInfoCard = ({ title, icon, date, amount, type, hideDeleteBtn, onDelete }) => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow duration-300">
      
      {/* Icon */}
      <div className="flex-shrink-0">
        {icon ? (
          <img
            src={icon}
            alt="icon"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <LuUtensils className="w-10 h-10 text-gray-400" />
        )}
      </div>

      {/* Transaction info */}
      <div className="flex-1 ml-4">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center space-x-4">
        {/* Delete button */}
        {!hideDeleteBtn && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <LuTrash2 className="w-5 h-5" />
          </button>
        )}

        {/* Amount */}
        <div className="flex items-center space-x-1">
          <h6 className={`font-semibold text-base ${type === "income" ? "text-green-500" : "text-red-500"}`}>
            {type === "income" ? "+" : "-"}${amount}
          </h6>
          {type === "income" ? (
            <LuTrendingUp className="text-green-500 w-4 h-4" />
          ) : (
            <LuTrendingDown className="text-red-500 w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransctionInfoCard;
