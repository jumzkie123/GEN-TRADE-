import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, MapPin, Printer, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../../lib/supabase";

interface MarketRow {
  id: string;
  crop_name: string;
  category: string;
  volume: number;
  value: number;
}

const CATEGORIES = [
  { name: "Herbicide", color: "from-emerald-600 to-emerald-500" },
  { name: "Insecticide", color: "from-sky-600 to-sky-500" },
  { name: "Molluscicide", color: "from-violet-600 to-violet-500" },
  { name: "Fungicide", color: "from-amber-600 to-amber-500" },
  { name: "Others", color: "from-slate-600 to-slate-500" }
];

export function ReportsPage() {
  const [selectedTerritory, setSelectedTerritory] = useState("All Territories");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [data, setData] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("market_potential")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && rows) setData(rows);
    setLoading(false);
  };

  useEffect(() => { fetchReportData(); }, []);

  // Get unique crop names
  const cropNames = [...new Set(data.map(r => r.crop_name))];

  // Build lookup
  const lookup: Record<string, Record<string, MarketRow>> = {};
  data.forEach(row => {
    if (!lookup[row.crop_name]) lookup[row.crop_name] = {};
    lookup[row.crop_name][row.category] = row;
  });

  // Calculate totals per category
  const totals: Record<string, { volume: number; value: number }> = {};
  CATEGORIES.forEach(cat => {
    totals[cat.name] = { volume: 0, value: 0 };
    data.filter(r => r.category === cat.name).forEach(r => {
      totals[cat.name].volume += Number(r.volume) || 0;
      totals[cat.name].value += Number(r.value) || 0;
    });
  });

  const grandTotalVolume = Object.values(totals).reduce((s, t) => s + t.volume, 0);
  const grandTotalValue = Object.values(totals).reduce((s, t) => s + t.value, 0);

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header & Filters */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center shadow-sm">
                <FileText className="h-6 w-6 text-[#2E7D32]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Dynamic Market Report</h2>
                <p className="text-sm text-gray-500 mt-0.5">Generate and preview territory potential reports</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 rounded-xl transition-all duration-300">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-[#2E7D32] hover:text-[#2E7D32] rounded-xl transition-all duration-300">
                <Download className="h-4 w-4 mr-2" /> Export PDF
              </Button>
              <Button className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 rounded-xl">
                <Download className="h-4 w-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gradient-to-r from-gray-50 to-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 tracking-wider">Territory</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedTerritory}
                  onChange={(e) => setSelectedTerritory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none transition-all cursor-pointer"
                >
                  <option>All Territories</option>
                  <option>North Region</option>
                  <option>South Region</option>
                  <option>East Region</option>
                  <option>West Region</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 tracking-wider">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 tracking-wider">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none transition-all" />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-600 rounded-xl transition-all duration-300" onClick={() => { setSelectedTerritory("All Territories"); setDateFrom("2026-01-01"); setDateTo("2026-12-31"); }}>
                <Filter className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Report preview bar */}
        <div className="px-6 py-3 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Report: {selectedTerritory} · {dateFrom} → {dateTo}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400">
              Total Volume: <span className="font-bold text-gray-600">{grandTotalVolume.toLocaleString()}</span>
            </span>
            <span className="text-[10px] text-gray-400">
              Total Value: <span className="font-bold text-[#2E7D32]">₱{grandTotalValue.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Report Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#2E7D32] animate-spin" />
            <span className="ml-3 text-gray-500 font-medium">Generating report...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold border-r border-gray-100 bg-gray-50/80 min-w-[200px] sticky left-0 z-10">
                    Crop Distribution
                  </th>
                  {CATEGORIES.map((cat) => (
                    <th key={cat.name} colSpan={2} className="px-0 py-0 border-r border-gray-100">
                      <div className={`bg-gradient-to-r ${cat.color} text-white px-4 py-3 text-center text-[10px] uppercase tracking-widest font-bold`}>
                        {cat.name}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-50/50">
                  {CATEGORIES.map((cat) => (
                    <React.Fragment key={`${cat.name}-sub`}>
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-50">Vol</th>
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-100">Val (₱)</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cropNames.map((cropName) => (
                  <tr key={cropName} className="border-b border-gray-50 hover:bg-green-50/20 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-800 border-r border-gray-100 sticky left-0 bg-white z-10">
                      {cropName}
                    </td>
                    {CATEGORIES.map((cat) => {
                      const row = lookup[cropName]?.[cat.name];
                      return (
                        <React.Fragment key={`${cropName}-${cat.name}`}>
                          <td className="px-4 py-3.5 text-center text-sm text-gray-600 border-r border-gray-50 tabular-nums">
                            {row ? Number(row.volume).toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm font-bold text-[#2E7D32] border-r border-gray-100 tabular-nums">
                            {row ? `₱${Number(row.value).toLocaleString()}` : "—"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold border-r border-gray-700 sticky left-0 bg-gray-800 z-10">Grand Total</td>
                  {CATEGORIES.map((cat) => (
                    <React.Fragment key={`${cat.name}-total`}>
                      <td className="px-4 py-4 text-center text-sm font-bold border-r border-gray-700/50 tabular-nums">{totals[cat.name].volume.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-green-400 border-r border-gray-700 tabular-nums">₱{totals[cat.name].value.toLocaleString()}</td>
                    </React.Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-gray-400 px-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          Live data from Supabase
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest">AgriTrade Territory Intelligence v1.0</p>
      </div>
    </div>
  );
}
