import { Search, MapPin } from "lucide-react";

const hectarages = [
  { id: 1, territory: "North Region A", crop: "Rice", totalHectarage: 3500, region: "Ilocos Region" },
  { id: 2, territory: "North Region B", crop: "Corn", totalHectarage: 2200, region: "Ilocos Region" },
  { id: 3, territory: "South Region A", crop: "Rice", totalHectarage: 2900, region: "Bicol Region" },
  { id: 4, territory: "South Region B", crop: "Corn", totalHectarage: 2800, region: "Bicol Region" },
  { id: 5, territory: "East Region A", crop: "Rice", totalHectarage: 4200, region: "Eastern Visayas" },
  { id: 6, territory: "East Region B", crop: "Vegetables", totalHectarage: 1800, region: "Eastern Visayas" },
  { id: 7, territory: "West Region A", crop: "Corn", totalHectarage: 3100, region: "Western Visayas" },
  { id: 8, territory: "West Region B", crop: "Vegetables", totalHectarage: 1500, region: "Western Visayas" },
  { id: 9, territory: "Central Region A", crop: "Rice", totalHectarage: 3800, region: "Central Luzon" },
  { id: 10, territory: "Central Region B", crop: "Corn", totalHectarage: 3100, region: "Central Luzon" },
];

export function HectaragesPage() {
  const totalHectarage = hectarages.reduce((sum, h) => sum + h.totalHectarage, 0);

  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl">Hectarage Distribution</h2>
              <p className="text-sm text-gray-600 mt-1">Agricultural land coverage by territory</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <MapPin className="h-5 w-5 text-[#2E7D32]" />
              <div>
                <p className="text-xs text-gray-600">Total Hectarage</p>
                <p className="text-[#2E7D32]">{totalHectarage.toLocaleString()} ha</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search territories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Regions</option>
              <option>Ilocos Region</option>
              <option>Bicol Region</option>
              <option>Eastern Visayas</option>
              <option>Western Visayas</option>
              <option>Central Luzon</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Crops</option>
              <option>Rice</option>
              <option>Corn</option>
              <option>Vegetables</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Territory</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Crop</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Total Hectarage</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Region</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hectarages.map((hectarage) => {
                const percentage = ((hectarage.totalHectarage / totalHectarage) * 100).toFixed(1);
                return (
                  <tr key={hectarage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{hectarage.territory}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-[#A5D6A7] text-[#1B5E20] rounded">
                        {hectarage.crop}
                      </span>
                    </td>
                    <td className="px-6 py-4">{hectarage.totalHectarage.toLocaleString()} ha</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{hectarage.region}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#2E7D32] h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
