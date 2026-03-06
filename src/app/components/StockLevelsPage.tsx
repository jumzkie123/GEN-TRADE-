import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, Sprout, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface CropStock {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  territory: string;
  min_stock: number;
  max_stock: number;
}

export function StockLevelsPage() {
  const [cropsData, setCropsData] = useState<CropStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStockLevels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data) setCropsData(data);
    setLoading(false);
  };

  useEffect(() => { fetchStockLevels(); }, []);

  const getStatus = (crop: CropStock) => {
    if (crop.stock <= crop.min_stock * 0.5) return "critical";
    if (crop.stock <= crop.min_stock) return "low";
    return "good";
  };

  const lowStockItems = cropsData.filter(c => getStatus(c) === "low" || getStatus(c) === "critical").length;
  const goodItems = cropsData.filter(c => getStatus(c) === "good").length;
  const criticalItems = cropsData.filter(c => getStatus(c) === "critical").length;

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Crops</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{cropsData.length}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">Across all territories</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Sprout className="h-7 w-7 text-[#2E7D32]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Low Stock</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockItems}</p>
              <p className="text-[10px] text-orange-400 mt-1 font-medium">Needs attention</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <TrendingDown className="h-7 w-7 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Healthy Stock</p>
              <p className="text-3xl font-bold text-[#2E7D32] mt-2">{goodItems}</p>
              <p className="text-[10px] text-green-500 mt-1 font-medium">Above minimum levels</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <CheckCircle2 className="h-7 w-7 text-[#2E7D32]" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Crop Stock Monitoring</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time status of territory crop reserves</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-[#2E7D32] animate-spin" />
              <span className="ml-3 text-gray-500 font-medium">Loading stock levels...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Crop</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Territory</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Current</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Min / Max</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Level</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cropsData.map((stock) => {
                  const status = getStatus(stock);
                  const percentage = stock.max_stock > stock.min_stock
                    ? ((stock.stock - stock.min_stock) / (stock.max_stock - stock.min_stock)) * 100
                    : 0;
                  const clampedPercentage = Math.max(0, Math.min(100, percentage));

                  return (
                    <tr key={stock.id} className="hover:bg-green-50/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                            <Sprout className="h-4 w-4 text-[#2E7D32]" />
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{stock.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-green-100 to-green-50 text-[#1B5E20] rounded-lg border border-green-200/50">
                          {stock.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{stock.territory}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{stock.stock.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 font-medium">
                          {stock.min_stock.toLocaleString()} / {stock.max_stock.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-gray-500">{clampedPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ease-out ${status === "critical" ? "bg-gradient-to-r from-red-500 to-red-400" :
                                  status === "low" ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                                    "bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]"
                                }`}
                              style={{ width: `${clampedPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {status === "critical" && (
                          <span className="px-3 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-lg flex items-center gap-1.5 w-fit border border-red-200/50">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </span>
                        )}
                        {status === "low" && (
                          <span className="px-3 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-lg flex items-center gap-1.5 w-fit border border-orange-200/50">
                            <TrendingDown className="h-3 w-3" /> Low
                          </span>
                        )}
                        {status === "good" && (
                          <span className="px-3 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-green-100 to-green-50 text-[#1B5E20] rounded-lg flex items-center gap-1.5 w-fit border border-green-200/50">
                            <CheckCircle2 className="h-3 w-3" /> Good
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">Monitoring {cropsData.length} crops</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400 font-medium">Live from Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
