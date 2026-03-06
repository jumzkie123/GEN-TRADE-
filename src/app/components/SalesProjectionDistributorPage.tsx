import { Plus, Search, Download } from "lucide-react";
import { Button } from "./ui/button";

const distributorProjections = [
  { id: 1, distributor: "AgriCorp North", product: "Urea Fertilizer", crop: "Rice", territory: "North", month: "March 2026", quantity: 1200 },
  { id: 2, distributor: "FarmSupply South", product: "NPK 16-16-16", crop: "Corn", territory: "South", month: "March 2026", quantity: 850 },
  { id: 3, distributor: "CropCare East", product: "Herbicide XP", crop: "Rice", territory: "East", month: "April 2026", quantity: 450 },
  { id: 4, distributor: "GreenFarm West", product: "Organic Compost", crop: "Vegetables", territory: "West", month: "April 2026", quantity: 1500 },
  { id: 5, distributor: "Central Agri", product: "Insecticide Pro", crop: "Corn", territory: "Central", month: "May 2026", quantity: 680 },
  { id: 6, distributor: "AgriCorp North", product: "Rice Seeds Premium", crop: "Rice", territory: "North", month: "May 2026", quantity: 920 },
  { id: 7, distributor: "FarmSupply South", product: "Corn Seeds Hybrid", crop: "Corn", territory: "South", month: "June 2026", quantity: 780 },
  { id: 8, distributor: "CropCare East", product: "Fungicide Plus", crop: "Rice", territory: "East", month: "June 2026", quantity: 380 }
];

export function SalesProjectionDistributorPage() {
  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl">Sales Projection (Distributor)</h2>
              <p className="text-sm text-gray-600 mt-1">Track sales projections by distributor</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Plus className="h-4 w-4 mr-2" />
                Add Projection
              </Button>
              <Button variant="outline" className="border-[#2E7D32] text-[#2E7D32]">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search distributors or products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Distributors</option>
              <option>AgriCorp North</option>
              <option>FarmSupply South</option>
              <option>CropCare East</option>
              <option>GreenFarm West</option>
              <option>Central Agri</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Territories</option>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
              <option>Central</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Distributor</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Product</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Crop</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Territory</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Month</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distributorProjections.map((projection) => (
                <tr key={projection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[#2E7D32] rounded-full flex items-center justify-center text-white text-xs">
                        {projection.distributor.charAt(0)}
                      </div>
                      <span>{projection.distributor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{projection.product}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-[#A5D6A7] text-[#1B5E20] rounded">
                      {projection.crop}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{projection.territory}</td>
                  <td className="px-6 py-4">{projection.month}</td>
                  <td className="px-6 py-4">{projection.quantity.toLocaleString()} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {distributorProjections.length} projections
          </div>
          <div className="text-sm">
            <span>Total Quantity: </span>
            <span className="text-[#2E7D32]">
              {distributorProjections.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
