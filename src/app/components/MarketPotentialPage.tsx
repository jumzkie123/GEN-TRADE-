import React, { useState, useEffect, useCallback } from 'react';
import { Download, Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../../lib/supabase";

interface MarketRow {
  id: string;
  crop_name: string;
  category: string;
  volume: number;
  value: number;
}

const CATEGORIES = ["Herbicide", "Insecticide", "Molluscicide", "Fungicide", "Others"];
const CATEGORY_STYLES: Record<string, { color: string; textColor: string }> = {
  Herbicide: { color: "from-emerald-50 to-emerald-100/50", textColor: "text-emerald-800" },
  Insecticide: { color: "from-sky-50 to-sky-100/50", textColor: "text-sky-800" },
  Molluscicide: { color: "from-violet-50 to-violet-100/50", textColor: "text-violet-800" },
  Fungicide: { color: "from-amber-50 to-amber-100/50", textColor: "text-amber-800" },
  Others: { color: "from-slate-50 to-slate-100/50", textColor: "text-slate-700" }
};

export function MarketPotentialPage() {
  const [data, setData] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, { volume?: number; value?: number }>>({});
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCropName, setNewCropName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("market_potential")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && rows) setData(rows);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Get unique crop names in order
  const cropNames = [...new Set(data.map(r => r.crop_name))];

  // Build a lookup: cropName -> category -> row
  const lookup: Record<string, Record<string, MarketRow>> = {};
  data.forEach(row => {
    if (!lookup[row.crop_name]) lookup[row.crop_name] = {};
    lookup[row.crop_name][row.category] = row;
  });

  // Handle changes
  const handleChange = (id: string, field: "volume" | "value", val: number) => {
    setChanges(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }));
  };

  // Get the display value (changed value or original)
  const getVal = (row: MarketRow, field: "volume" | "value") => {
    if (changes[row.id] && changes[row.id][field] !== undefined) return changes[row.id][field]!;
    return row[field];
  };

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(changes).map(([id, vals]) =>
      supabase.from("market_potential").update({ ...vals, updated_at: new Date().toISOString() }).eq("id", id)
    );
    await Promise.all(updates);
    setChanges({});
    setSaving(false);
    fetchData();
  };

  // Add new crop row
  const handleAddCrop = async () => {
    if (!newCropName.trim()) return;
    const rows = CATEGORIES.map(cat => ({
      crop_name: newCropName.trim(),
      category: cat,
      volume: 0,
      value: 0
    }));
    await supabase.from("market_potential").insert(rows);
    setNewCropName("");
    setShowAddCrop(false);
    fetchData();
  };

  // Remove a crop (all its category rows)
  const handleRemoveCrop = async (cropName: string) => {
    if (!confirm(`Remove "${cropName}" from market potential?`)) return;
    await supabase.from("market_potential").delete().eq("crop_name", cropName);
    fetchData();
  };

  // Calculate totals per category
  const totals: Record<string, { volume: number; value: number }> = {};
  CATEGORIES.forEach(cat => {
    totals[cat] = { volume: 0, value: 0 };
    data.filter(r => r.category === cat).forEach(r => {
      totals[cat].volume += getVal(r, "volume");
      totals[cat].value += getVal(r, "value");
    });
  });

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Market Potential Analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">Detailed market size by crop and chemical category</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 rounded-xl transition-all duration-300" onClick={() => setShowAddCrop(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Crop
              </Button>
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-[#2E7D32] hover:text-[#2E7D32] rounded-xl transition-all duration-300">
                <Download className="h-4 w-4 mr-2" /> Export Excel
              </Button>
              <Button
                className={`rounded-xl transition-all duration-300 ${hasChanges ? "bg-gradient-to-r from-[#2E7D32] to-[#388E3C] shadow-md shadow-green-500/20 hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"}`}
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes {hasChanges && `(${Object.keys(changes).length})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Add Crop Modal */}
        {showAddCrop && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddCrop(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add New Crop</h3>
                <button onClick={() => setShowAddCrop(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Crop Name</label>
                <input value={newCropName} onChange={e => setNewCropName(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" placeholder="e.g. Sugarcane" />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddCrop(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] rounded-xl" onClick={handleAddCrop} disabled={!newCropName.trim()}>
                  <Plus className="h-4 w-4 mr-2" /> Add Crop
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#2E7D32] animate-spin" />
            <span className="ml-3 text-gray-500 font-medium">Loading market data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold border-r border-gray-100 bg-gray-50/80 min-w-[220px] sticky left-0 z-10">
                    Crop
                  </th>
                  {CATEGORIES.map((cat) => (
                    <th key={cat} colSpan={2} className={`px-4 py-3 text-center text-[10px] uppercase tracking-widest font-bold border-r border-gray-100 bg-gradient-to-b ${CATEGORY_STYLES[cat].color} ${CATEGORY_STYLES[cat].textColor}`}>
                      {cat}
                    </th>
                  ))}
                  <th rowSpan={2} className="px-3 py-4 text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-gray-50/80 w-10"></th>
                </tr>
                <tr className="bg-gray-50/50">
                  {CATEGORIES.map((cat) => (
                    <React.Fragment key={`${cat}-sub`}>
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-50">Vol</th>
                      <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-100">Val (₱)</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cropNames.map((cropName) => (
                  <tr key={cropName} className="border-b border-gray-50 hover:bg-green-50/20 transition-colors group">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800 border-r border-gray-100 sticky left-0 bg-white z-10 group-hover:bg-green-50/20">
                      {cropName}
                    </td>
                    {CATEGORIES.map((cat) => {
                      const row = lookup[cropName]?.[cat];
                      if (!row) return (
                        <React.Fragment key={`${cropName}-${cat}`}>
                          <td className="px-1 py-1 border-r border-gray-50 text-center text-gray-300 text-sm">—</td>
                          <td className="px-1 py-1 border-r border-gray-100 text-center text-gray-300 text-sm">—</td>
                        </React.Fragment>
                      );
                      return (
                        <React.Fragment key={`${cropName}-${cat}`}>
                          <td className="px-1 py-1 border-r border-gray-50">
                            <input
                              type="number"
                              value={getVal(row, "volume")}
                              onChange={e => handleChange(row.id, "volume", Number(e.target.value))}
                              className="w-full text-center text-sm bg-transparent hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-400 rounded-lg p-2 border border-transparent hover:border-gray-200 transition-all duration-200 outline-none"
                            />
                          </td>
                          <td className="px-1 py-1 border-r border-gray-100">
                            <input
                              type="number"
                              value={getVal(row, "value")}
                              onChange={e => handleChange(row.id, "value", Number(e.target.value))}
                              className="w-full text-center text-sm font-semibold text-[#2E7D32] bg-transparent hover:bg-green-50/50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-400 rounded-lg p-2 border border-transparent hover:border-gray-200 transition-all duration-200 outline-none"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-1 py-1 text-center">
                      <button onClick={() => handleRemoveCrop(cropName)} className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Remove crop">
                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold border-r border-gray-700 sticky left-0 bg-gray-800 z-10">Grand Total</td>
                  {CATEGORIES.map((cat) => (
                    <React.Fragment key={`${cat}-total`}>
                      <td className="px-4 py-4 text-center text-sm font-bold border-r border-gray-700/50 tabular-nums">{totals[cat].volume.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-green-400 border-r border-gray-700 tabular-nums">₱{totals[cat].value.toLocaleString()}</td>
                    </React.Fragment>
                  ))}
                  <td className="bg-gray-800"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">{cropNames.length} crops · {CATEGORIES.length} categories</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400 font-medium">Live from Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
