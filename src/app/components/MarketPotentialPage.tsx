import React, { useState, useEffect } from 'react';
import { Download, Save, Loader2, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

interface MarketRow {
  id: string;
  crop_name: string;
  category: string;
  volume: number;
  value: number;
  record_date: string;
}

const CATEGORY_STYLES: Record<string, { color: string; textColor: string }> = {
  Herbicide: { color: "from-emerald-50 to-emerald-100/50", textColor: "text-emerald-800" },
  Insecticide: { color: "from-sky-50 to-sky-100/50", textColor: "text-sky-800" },
  Molluscicide: { color: "from-violet-50 to-violet-100/50", textColor: "text-violet-800" },
  Fungicide: { color: "from-amber-50 to-amber-100/50", textColor: "text-amber-800" },
  Others: { color: "from-slate-50 to-slate-100/50", textColor: "text-slate-700" }
};

const DEFAULT_STYLE = { color: "from-gray-50 to-gray-100/50", textColor: "text-gray-700" };

export function MarketPotentialPage({ category = "Herbicide", initialCategories = [] }: { category?: string; initialCategories?: string[] }) {
  const [data, setData] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, { volume?: number; value?: number }>>({});
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCropName, setNewCropName] = useState("");
  const [newCropCategory, setNewCropCategory] = useState("Grain");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastSavedInfo, setLastSavedInfo] = useState<{ count: number; date: string } | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>(initialCategories);
  const [masterCrops, setMasterCrops] = useState<{name: string, category: string}[]>([]);

  useEffect(() => {
    if (initialCategories.length > 0) setAllCategories(initialCategories);
  }, [initialCategories]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch categories if not provided
    if (initialCategories.length === 0) {
      const { data: catData } = await supabase.from("market_categories").select("name");
      if (catData) setAllCategories(catData.map(c => c.name));
    }

    // Fetch master crop list with categories
    const { data: cropData } = await supabase.from("crops").select("name, category").order("name");
    if (cropData) setMasterCrops(cropData);

    // Fetch potential data for this date
    const { data: rows, error } = await supabase
      .from("market_potential")
      .select("*")
      .eq("record_date", selectedDate);
    
    if (!error && rows) setData(rows);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedDate, category]);

  // Group masterCrops by category
  const categoriesInMaster = ["Grain", "Vegetables", "Fruit", "Others"];
  const cropsByCategory: Record<string, string[]> = {};
  categoriesInMaster.forEach(cat => cropsByCategory[cat] = []);
  
  if (masterCrops.length > 0) {
    masterCrops.forEach(c => {
      if (!cropsByCategory[c.category]) cropsByCategory[c.category] = [];
      cropsByCategory[c.category].push(c.name);
    });
  } else {
    // Fallback if no master crops
    const fallbackUnique = [...new Set(data.map(r => r.crop_name))].sort();
    fallbackUnique.forEach(name => {
      if (!cropsByCategory["Others"]) cropsByCategory["Others"] = [];
      cropsByCategory["Others"].push(name);
    });
  }

  // Build a lookup: cropName -> category -> row
  const lookup: Record<string, Record<string, MarketRow>> = {};
  data.forEach(row => {
    if (!lookup[row.crop_name]) lookup[row.crop_name] = {};
    lookup[row.crop_name][row.category] = row;
  });

  // Handle changes
  const handleChange = (cropName: string, field: "volume" | "value", val: number) => {
    setChanges(prev => ({
      ...prev,
      [`${cropName}-${category}`]: { ...prev[`${cropName}-${category}`], crop_name: cropName, [field]: val }
    }));
  };

  // Get the display value (changed value or original)
  const getVal = (row: MarketRow | undefined, cropName: string, field: "volume" | "value") => {
    const changeKey = `${cropName}-${category}`;
    if (changes[changeKey] && (changes[changeKey] as any)[field] !== undefined) return (changes[changeKey] as any)[field]!;
    return row ? (row as any)[field] : 0;
  };

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.values(changes).map((vals: any) => ({
      crop_name: vals.crop_name,
      category: category,
      record_date: selectedDate,
      volume: vals.volume !== undefined ? vals.volume : 0,
      value: vals.value !== undefined ? vals.value : 0,
    }));

    if (upserts.length > 0) {
      const { error } = await supabase.from("market_potential").upsert(upserts, {
        onConflict: 'crop_name,category,record_date'
      });
      if (error) console.error(error);
      else setLastSavedInfo({ count: upserts.length, date: selectedDate });
    }
    
    setChanges({});
    setSaving(false);
    fetchData();
  };

  // Add new crop globally
  const handleAddCrop = async () => {
    if (!newCropName.trim()) return;
    
    // Insert into master crops table
    const { error } = await supabase.from("crops").insert({
      name: newCropName.trim(),
      category: newCropCategory,
    });

    if (!error) {
      setNewCropName("");
      setNewCropCategory("Grain");
      setShowAddCrop(false);
      fetchData();
    } else {
      console.error(error);
    }
  };

  // Remove a crop (all its category rows and from master list)
  const handleRemoveCrop = async (cropName: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${cropName}"? This will remove it from ALL categories, dates, and the global crop inventory.`)) return;
    
    setLoading(true);
    try {
      // 1. Delete all market potential records for this crop across all dates/categories
      await supabase.from("market_potential").delete().eq("crop_name", cropName);
      
      // 2. Delete the crop from the master crops table
      const { error } = await supabase.from("crops").delete().eq("name", cropName);
      
      if (error) {
        console.error("Delete error:", error);
        alert("Error deleting crop: " + error.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      fetchData();
    }
  };

  // Calculate totals per category
  const totals: Record<string, { volume: number; value: number }> = {};
  const currentCats = allCategories.length > 0 ? allCategories : [category];
  currentCats.forEach(cat => {
    totals[cat] = { volume: 0, value: 0 };
    Object.values(cropsByCategory).flat().forEach(cropName => {
      const row = lookup[cropName]?.[cat];
      totals[cat].volume += getVal(row, cropName, "volume");
      totals[cat].value += getVal(row, cropName, "value");
    });
  });

  const hasChanges = Object.keys(changes).length > 0;
  const activeStyle = CATEGORY_STYLES[category] || DEFAULT_STYLE;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Market Potential: {category}</h2>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Market size analysis for {selectedDate}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 rounded-xl transition-all duration-300" onClick={() => setShowAddCrop(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Crop
              </Button>
              {lastSavedInfo && (
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-green-600 uppercase">Last Saved</span>
                  <span className="text-[10px] text-gray-400">{lastSavedInfo.date}</span>
                </div>
              )}
              <Button
                className={`rounded-xl transition-all duration-300 ${hasChanges ? "bg-gradient-to-r from-[#2E7D32] to-[#388E3C] shadow-md shadow-green-500/20 hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"}`}
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save for {selectedDate} {hasChanges && `(${Object.keys(changes).length})`}
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
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Crop Name</label>
                  <input value={newCropName} onChange={e => setNewCropName(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" placeholder="e.g. Tomato" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Section / Category</label>
                  <select 
                    value={newCropCategory} 
                    onChange={e => setNewCropCategory(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none"
                  >
                    <option value="Grain">Grain (Rice, Corn, etc)</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruit">Fruit (Mango, etc)</option>
                    <option value="Others">Other Crops</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddCrop(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] rounded-xl" onClick={handleAddCrop} disabled={!newCropName.trim()}>
                  <Plus className="h-4 w-4 mr-2" /> Add Crop
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table Sections */}
        <div className="p-6 bg-gray-50/30">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-left text-[11px] uppercase tracking-widest text-gray-500 font-bold border-b border-dashed border-gray-200 w-1/3 bg-gray-50/50">
                    CROP
                  </th>
                  <th colSpan={2} className={`px-4 py-3 text-center text-[11px] uppercase tracking-widest font-bold bg-gradient-to-b ${activeStyle.color} ${activeStyle.textColor}`}>
                    {category}
                  </th>
                </tr>
                <tr className={`bg-gradient-to-b ${activeStyle.color}`}>
                  <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold border-t border-white/40 border-r border-white/40 w-1/3">VOL</th>
                  <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold border-t border-white/40 w-1/3">VAL (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={`skeleton-${i}`} className="border-b border-gray-50">
                          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-20 mx-auto rounded-lg" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-24 mx-auto rounded-lg" /></td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {categoriesInMaster.map((catGroup) => {
                        const crops = cropsByCategory[catGroup].sort();
                        if (crops.length === 0) return null;
                        return (
                          <React.Fragment key={catGroup}>
                            <tr className="bg-gray-100/50">
                              <td colSpan={3} className="px-6 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                {catGroup === "Others" ? "Other Crops" : catGroup}
                              </td>
                            </tr>
                            {crops.map((cropName, idx) => {
                              const row = lookup[cropName]?.[category];
                              return (
                                <motion.tr 
                                  key={cropName}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                                >
                                  <td className="px-6 py-3 text-sm font-semibold text-gray-800 bg-white">
                                    <div className="flex items-center justify-between">
                                      <span>{cropName}</span>
                                      <button onClick={() => handleRemoveCrop(cropName)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all" title="Remove crop">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 border-l border-gray-50 bg-white">
                                    <input
                                      type="number"
                                      value={getVal(row, cropName, "volume") || ""}
                                      placeholder="0"
                                      onChange={e => handleChange(cropName, "volume", Number(e.target.value))}
                                      className="w-full text-center text-sm bg-transparent hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-400 rounded-lg p-2 border border-transparent hover:border-gray-200 transition-all duration-200 outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5 border-l border-gray-50 bg-white">
                                    <input
                                      type="number"
                                      value={getVal(row, cropName, "value") || ""}
                                      placeholder="0"
                                      onChange={e => handleChange(cropName, "value", Number(e.target.value))}
                                      className="w-full text-center text-sm font-semibold text-[#2E7D32] bg-transparent hover:bg-green-50/50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-400 rounded-lg p-2 border border-transparent hover:border-gray-200 transition-all duration-200 outline-none"
                                    />
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </AnimatePresence>
              </tbody>
                <tfoot>
                  <tr className="bg-[#1C2434] text-white">
                    <td className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold">Grand Total</td>
                    <td className="px-4 py-4 text-center text-sm font-bold border-l border-gray-700/50 tabular-nums">
                      {loading ? <Skeleton className="h-4 w-16 bg-gray-700 mx-auto" /> : (totals[category]?.volume || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-green-400 border-l border-gray-700/50 tabular-nums">
                      {loading ? <Skeleton className="h-4 w-20 bg-gray-700 mx-auto" /> : `₱${(totals[category]?.value || 0).toLocaleString()}`}
                    </td>
                  </tr>
                </tfoot>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">{Object.values(cropsByCategory).flat().length} crops · {allCategories.length || 5} categories</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400 font-medium">Live from Supabase ({selectedDate})</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
