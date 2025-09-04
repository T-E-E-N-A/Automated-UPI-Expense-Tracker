import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const CustomBarchart = ({
  data = [],
  height = 260,
  yTickFormatter = (n) => new Intl.NumberFormat().format(n),
  xKey = "label",
  yKey = "value",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[260px] flex items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis
              tickFormatter={yTickFormatter}
              width={48}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <Tooltip
              cursor={{ fillOpacity: 0.08 }}
              formatter={(value) => [yTickFormatter(value), "Amount"]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
              }}
            />
            <Bar dataKey={yKey} radius={[10, 10, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomBarchart;
