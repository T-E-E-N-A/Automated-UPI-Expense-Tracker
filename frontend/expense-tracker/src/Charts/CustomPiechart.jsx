import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const CustomPiechart = ({ data, label, totalAmount, color, showTextAnchor }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md mx-auto">
 
      {label && (
        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
          {label}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={80}
            paddingAngle={4}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || '#3B82F6'}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px', border: 'none' }}
            itemStyle={{ color: '#111827', fontWeight: 500 }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '14px', color: '#4b5563' }}
          />

          {showTextAnchor && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color || '#111827'}
              fontSize="22px"
              fontWeight="bold"
            >
              {totalAmount}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPiechart;
