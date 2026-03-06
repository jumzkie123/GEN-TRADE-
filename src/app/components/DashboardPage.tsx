import { Package, TrendingUp, Target, Sprout, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const stats = [
  { label: "Total Inventory Products", value: "1,245", icon: Package, color: "bg-blue-500" },
  { label: "Total Sales Projection", value: "₱12.5M", icon: TrendingUp, color: "bg-green-500" },
  { label: "Total Market Potential", value: "₱25.8M", icon: Target, color: "bg-purple-500" },
  { label: "Total Hectarage Area", value: "15,420 ha", icon: Sprout, color: "bg-orange-500" },
  { label: "Total Marketing Activities", value: "48", icon: Calendar, color: "bg-pink-500" }
];

const salesData = [
  { month: "Jan", sales: 4200 },
  { month: "Feb", sales: 5100 },
  { month: "Mar", sales: 4800 },
  { month: "Apr", sales: 6200 },
  { month: "May", sales: 7100 },
  { month: "Jun", sales: 6800 }
];

const cropData = [
  { name: "Rice", value: 4500, color: "#2E7D32" },
  { name: "Corn", value: 3200, color: "#66BB6A" },
  { name: "Vegetables", value: 2800, color: "#A5D6A7" },
  { name: "Fruits", value: 1900, color: "#81C784" }
];

const territoryData = [
  { territory: "North", performance: 85 },
  { territory: "South", performance: 72 },
  { territory: "East", performance: 90 },
  { territory: "West", performance: 68 },
  { territory: "Central", performance: 78 }
];

export function DashboardPage() {
  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4">Sales Projection (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#2E7D32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {cropData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="mb-4">Territory Performance (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={territoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="territory" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="performance" fill="#2E7D32" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
