import { Plus, Search, Calendar } from "lucide-react";
import { Button } from "./ui/button";

const activities = [
  { id: 1, activityName: "Farmer Training Workshop", location: "Barangay San Jose, North", crop: "Rice", date: "2026-03-15", budget: 50000, remarks: "150 farmers expected" },
  { id: 2, activityName: "Product Demonstration", location: "Municipal Hall, South", crop: "Corn", date: "2026-03-20", budget: 35000, remarks: "New fertilizer demo" },
  { id: 3, activityName: "Agricultural Field Day", location: "Demo Farm, East", crop: "Vegetables", date: "2026-03-25", budget: 75000, remarks: "Multi-crop showcase" },
  { id: 4, activityName: "Pest Management Seminar", location: "Community Center, West", crop: "Rice", date: "2026-04-05", budget: 45000, remarks: "IPM techniques" },
  { id: 5, activityName: "Seed Distribution Drive", location: "Various Barangays, Central", crop: "Corn", date: "2026-04-10", budget: 120000, remarks: "500 farmers target" },
  { id: 6, activityName: "Organic Farming Workshop", location: "Training Center, North", crop: "Vegetables", date: "2026-04-15", budget: 60000, remarks: "Composting focus" },
];

export function MarketDevelopmentPage() {
  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Market Development Activities</h2>
            <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Crops</option>
              <option>Rice</option>
              <option>Corn</option>
              <option>Vegetables</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Activity Name</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Location</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Crop</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Budget</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{activity.activityName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{activity.location}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-[#A5D6A7] text-[#1B5E20] rounded">
                      {activity.crop}
                    </span>
                  </td>
                  <td className="px-6 py-4">{activity.date}</td>
                  <td className="px-6 py-4">₱{activity.budget.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{activity.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {activities.length} activities
          </div>
          <div className="text-sm">
            <span>Total Budget: </span>
            <span className="text-[#2E7D32]">
              ₱{activities.reduce((sum, a) => sum + a.budget, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
