import { Plus, Download, Save } from "lucide-react";
import { Button } from "./ui/button";

const potData = [
  { id: 1, territory: "North Region", product: "Urea Fertilizer", q1Target: 1200, q1Actual: 1150, q2Target: 1300, q2Actual: 0, q3Target: 1250, q3Actual: 0, q4Target: 1400, q4Actual: 0 },
  { id: 2, territory: "North Region", product: "NPK 16-16-16", q1Target: 950, q1Actual: 980, q2Target: 1000, q2Actual: 0, q3Target: 1050, q3Actual: 0, q4Target: 1100, q4Actual: 0 },
  { id: 3, territory: "South Region", product: "Herbicide XP", q1Target: 450, q1Actual: 420, q2Target: 480, q2Actual: 0, q3Target: 500, q3Actual: 0, q4Target: 520, q4Actual: 0 },
  { id: 4, territory: "East Region", product: "Rice Seeds Premium", q1Target: 800, q1Actual: 850, q2Target: 900, q2Actual: 0, q3Target: 850, q3Actual: 0, q4Target: 950, q4Actual: 0 },
  { id: 5, territory: "West Region", product: "Organic Compost", q1Target: 1500, q1Actual: 1480, q2Target: 1600, q2Actual: 0, q3Target: 1550, q3Actual: 0, q4Target: 1700, q4Actual: 0 },
];

export function POTPage() {
  return (
    <div className="p-8 bg-[#F1F8E9] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl">POT (Plan of Target)</h2>
              <p className="text-sm text-gray-600 mt-1">Quarterly targets and actual performance tracking</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-[#2E7D32] text-[#2E7D32]">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 sticky left-0 bg-gray-50">Territory</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 sticky left-32 bg-gray-50">Product</th>
                <th colSpan={2} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600 border-l border-gray-300 bg-blue-50">Q1 2026</th>
                <th colSpan={2} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600 border-l border-gray-300 bg-green-50">Q2 2026</th>
                <th colSpan={2} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600 border-l border-gray-300 bg-yellow-50">Q3 2026</th>
                <th colSpan={2} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600 border-l border-gray-300 bg-purple-50">Q4 2026</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2 text-xs text-gray-600 border-l border-gray-300">Target</th>
                <th className="px-4 py-2 text-xs text-gray-600">Actual</th>
                <th className="px-4 py-2 text-xs text-gray-600 border-l border-gray-300">Target</th>
                <th className="px-4 py-2 text-xs text-gray-600">Actual</th>
                <th className="px-4 py-2 text-xs text-gray-600 border-l border-gray-300">Target</th>
                <th className="px-4 py-2 text-xs text-gray-600">Actual</th>
                <th className="px-4 py-2 text-xs text-gray-600 border-l border-gray-300">Target</th>
                <th className="px-4 py-2 text-xs text-gray-600">Actual</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {potData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white">{row.territory}</td>
                  <td className="px-4 py-3 sticky left-32 bg-white">{row.product}</td>
                  <td className="px-4 py-3 text-center border-l border-gray-200">
                    <input 
                      type="number" 
                      value={row.q1Target} 
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      value={row.q1Actual} 
                      className={`w-20 text-center border rounded px-2 py-1 ${
                        row.q1Actual >= row.q1Target ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-l border-gray-200">
                    <input 
                      type="number" 
                      value={row.q2Target} 
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      value={row.q2Actual} 
                      placeholder="-"
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-l border-gray-200">
                    <input 
                      type="number" 
                      value={row.q3Target} 
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      value={row.q3Actual} 
                      placeholder="-"
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-l border-gray-200">
                    <input 
                      type="number" 
                      value={row.q4Target} 
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      value={row.q4Actual} 
                      placeholder="-"
                      className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <div className="text-sm text-gray-600">
              <span className="mr-4">
                Q1 Achievement: <span className="text-[#2E7D32]">97.2%</span>
              </span>
              <span>
                Overall Target: <span className="text-[#2E7D32]">5,500 units</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
