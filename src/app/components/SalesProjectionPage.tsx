import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "./ui/button";

const salesProjections = [
  { id: 1, product: "Urea Fertilizer", crop: "Rice", territory: "North", month: "January 2026", projectedSales: 450000, distributor: "AgriCorp North" },
  { id: 2, product: "NPK 16-16-16", crop: "Corn", territory: "South", month: "January 2026", projectedSales: 380000, distributor: "FarmSupply South" },
  { id: 3, product: "Herbicide XP", crop: "Rice", territory: "East", month: "February 2026", projectedSales: 220000, distributor: "CropCare East" },
  { id: 4, product: "Organic Compost", crop: "Vegetables", territory: "West", month: "February 2026", projectedSales: 320000, distributor: "GreenFarm West" },
  { id: 5, product: "Rice Seeds Premium", crop: "Rice", territory: "North", month: "March 2026", projectedSales: 580000, distributor: "AgriCorp North" },
  { id: 6, product: "Insecticide Pro", crop: "Corn", territory: "Central", month: "March 2026", projectedSales: 275000, distributor: "Central Agri" },
  { id: 7, product: "Corn Seeds Hybrid", crop: "Corn", territory: "South", month: "April 2026", projectedSales: 420000, distributor: "FarmSupply South" },
  { id: 8, product: "Fungicide Plus", crop: "Rice", territory: "East", month: "April 2026", projectedSales: 190000, distributor: "CropCare East" }
];

export function SalesProjectionPage() {
  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Sales Projection</h2>
            <div className="flex gap-3">
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Plus className="h-4 w-4 mr-2" />
                Add Projection
              </Button>
              <Button variant="outline" className="border-[#2E7D32] text-[#2E7D32]">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projections..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Crops</option>
              <option>Rice</option>
              <option>Corn</option>
              <option>Vegetables</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
              <option>All Territories</option>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
              <option>Central</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Product</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Crop</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Territory</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Month</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Projected Sales</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">Distributor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesProjections.map((projection) => (
                <tr key={projection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{projection.product}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-[#A5D6A7] text-[#1B5E20] rounded">
                      {projection.crop}
                    </span>
                  </td>
                  <td className="px-6 py-4">{projection.territory}</td>
                  <td className="px-6 py-4">{projection.month}</td>
                  <td className="px-6 py-4">₱{projection.projectedSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{projection.distributor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {salesProjections.length} projections
          </div>
          <div className="text-sm">
            <span>Total Projected: </span>
            <span className="text-[#2E7D32]">
              ₱{salesProjections.reduce((sum, p) => sum + p.projectedSales, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
