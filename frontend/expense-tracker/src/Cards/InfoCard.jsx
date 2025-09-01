const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300">
      {/* Icon directly as provided */}
      <div className={`text-500 text-2xl`}>
        {icon}
      </div>

      {/* Text section */}
      <div>
        <h6 className="text-sm text-gray-500 font-medium">{label}</h6>
        <span className="text-lg font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
