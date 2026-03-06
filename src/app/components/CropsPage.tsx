import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Sprout, ArrowUpDown, X, Save, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../../lib/supabase";

interface Crop {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  territory: string;
  min_stock: number;
  max_stock: number;
  created_at: string;
  updated_at: string;
}

const emptyForm: Omit<Crop, "id" | "created_at" | "updated_at"> = {
  name: "", category: "Grain", stock: 0, unit: "kg", territory: "", min_stock: 0, max_stock: 10000
};

export function CropsPage() {
  const [cropsData, setCropsData] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [territoryFilter, setTerritoryFilter] = useState("All Territories");
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Fetch data
  const fetchCrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setCropsData(data);
    setLoading(false);
  };

  useEffect(() => { fetchCrops(); }, []);

  // Save (Create or Update)
  const handleSave = async () => {
    setSaving(true);
    if (editingCrop) {
      await supabase.from("crops").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editingCrop.id);
    } else {
      await supabase.from("crops").insert([form]);
    }
    setSaving(false);
    setShowForm(false);
    setEditingCrop(null);
    setForm(emptyForm);
    fetchCrops();
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop?")) return;
    await supabase.from("crops").delete().eq("id", id);
    fetchCrops();
  };

  // Edit
  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setForm({ name: crop.name, category: crop.category, stock: crop.stock, unit: crop.unit, territory: crop.territory, min_stock: crop.min_stock, max_stock: crop.max_stock });
    setShowForm(true);
  };

  // Filter
  const filtered = cropsData.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "All Categories" || c.category === categoryFilter;
    const matchTerr = territoryFilter === "All Territories" || c.territory === territoryFilter;
    return matchSearch && matchCat && matchTerr;
  });

  const categories = [...new Set(cropsData.map(c => c.category))];
  const territories = [...new Set(cropsData.map(c => c.territory))];

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Crops</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{cropsData.length}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sprout className="h-6 w-6 text-[#2E7D32]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ArrowUpDown className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{cropsData.reduce((s, c) => s + c.stock, 0).toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl font-bold text-purple-600">∑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditingCrop(null); setForm(emptyForm); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">{editingCrop ? "Edit Crop" : "Add New Crop"}</h3>
              <button onClick={() => { setShowForm(false); setEditingCrop(null); setForm(emptyForm); }} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Crop Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" placeholder="e.g. Rice" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none">
                    <option>Grain</option><option>Fruit</option><option>Veg</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none">
                    <option>kg</option><option>units</option><option>L</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Territory</label>
                  <input value={form.territory} onChange={e => setForm({ ...form, territory: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" placeholder="e.g. North" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Min Stock</label>
                  <input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: Number(e.target.value) })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Max Stock</label>
                  <input type="number" value={form.max_stock} onChange={e => setForm({ ...form, max_stock: Number(e.target.value) })} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setShowForm(false); setEditingCrop(null); setForm(emptyForm); }}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] shadow-md shadow-green-500/20 rounded-xl" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {editingCrop ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crop Inventory</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track crop data across territories</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 rounded-xl" onClick={() => { setForm(emptyForm); setEditingCrop(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search crops..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all duration-200" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all cursor-pointer">
              <option>All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={territoryFilter} onChange={e => setTerritoryFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all cursor-pointer">
              <option>All Territories</option>
              {territories.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-[#2E7D32] animate-spin" />
              <span className="ml-3 text-gray-500 font-medium">Loading crops...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Crop Name</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Stock Qty</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Unit</th>
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold">Territory</th>
                  <th className="px-6 py-4 text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((crop) => (
                  <tr key={crop.id} className="hover:bg-green-50/40 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                          <Sprout className="h-4 w-4 text-[#2E7D32]" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{crop.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-green-100 to-green-50 text-[#1B5E20] rounded-lg border border-green-200/50">
                        {crop.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${crop.stock < (crop.min_stock || 500) ? "text-red-600" : "text-gray-900"}`}>
                        {crop.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{crop.unit}</td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700 font-medium">{crop.territory}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(crop)} className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn">
                          <Edit className="h-3.5 w-3.5 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                        </button>
                        <button onClick={() => handleDelete(crop.id)} className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 group/btn">
                          <Trash2 className="h-3.5 w-3.5 text-gray-400 group-hover/btn:text-red-600 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No crops found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {cropsData.length} crops</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400 font-medium">Connected to Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
