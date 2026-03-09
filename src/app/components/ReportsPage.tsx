import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, MapPin, Printer, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface MarketRow {
  crop_name: string;
  category: string;
  volume: number;
  value: number;
  record_date: string;
}

interface CategoryInfo {
  name: string;
  color: string;
}

const DEFAULT_CATEGORY_COLORS = [
  "from-emerald-600 to-emerald-500",
  "from-sky-600 to-sky-500",
  "from-violet-600 to-violet-500",
  "from-amber-600 to-amber-500",
  "from-slate-600 to-slate-500"
];



export function ReportsPage({ categories: externalCategories = [] }: { categories?: CategoryInfo[] }) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  const [data, setData] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryInfo[]>(externalCategories);
  const [masterCrops, setMasterCrops] = useState<{name: string, category: string}[]>([]);

  // Sync with prop change
  useEffect(() => {
    if (externalCategories.length > 0) {
      setCategories(externalCategories.map((c, i) => ({
        ...c,
        color: c.color || DEFAULT_CATEGORY_COLORS[i % DEFAULT_CATEGORY_COLORS.length]
      })));
    }
  }, [externalCategories]);

  const fetchReportData = async () => {
    setLoading(true);
    
    // Fetch categories if not passed or to refresh
    if (externalCategories.length === 0) {
      const { data: catData } = await supabase.from("market_categories").select("name").order("created_at");
      if (catData) {
        setCategories(catData.map((c, i) => ({
          name: c.name,
          color: DEFAULT_CATEGORY_COLORS[i % DEFAULT_CATEGORY_COLORS.length]
        })));
      }
    }

    // Fetch master crops with categories
    const { data: cropData } = await supabase.from("crops").select("name, category").order("name");
    if (cropData) setMasterCrops(cropData);

    const { data: rows, error } = await supabase
      .from("market_potential")
      .select("*")
      .gte("record_date", dateFrom)
      .lte("record_date", dateTo);
    
    if (!error && rows) {
      // Aggregate data by crop_name and category
      const aggregated: Record<string, MarketRow> = {};
      rows.forEach(r => {
        const key = `${r.crop_name}-${r.category}`;
        if (!aggregated[key]) {
          aggregated[key] = { ...r, volume: 0, value: 0 };
        }
        aggregated[key].volume += Number(r.volume) || 0;
        aggregated[key].value += Number(r.value) || 0;
      });
      setData(Object.values(aggregated));
    }
    setLoading(false);
  };

  // Group crops by category
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

  useEffect(() => { 
    // Initial fetch for categories and default data
    fetchReportData(); 
  }, []);

  // Build lookup
  const lookup: Record<string, Record<string, MarketRow>> = {};
  data.forEach(row => {
    if (!lookup[row.crop_name]) lookup[row.crop_name] = {};
    lookup[row.crop_name][row.category] = row;
  });

  // Calculate totals per category
  const totals: Record<string, { volume: number; value: number }> = {};
  categories.forEach(cat => {
    totals[cat.name] = { volume: 0, value: 0 };
    data.filter(r => r.category === cat.name).forEach(r => {
      totals[cat.name].volume += r.volume;
      totals[cat.name].value += r.value;
    });
  });

  const grandTotalVolume = Object.values(totals).reduce((s, t) => s + t.volume, 0);
  const grandTotalValue = Object.values(totals).reduce((s, t) => s + t.value, 0);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mkt Potential');

    // Header Info
    const exportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Formatting Helpers
    const setBorder = (cell: ExcelJS.Cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    };

    // Title Rows
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'GEN. TRADE TERRITORY - MARKET POTENTIAL REPORT';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:K2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Exported on: ${exportDate}`;
    dateCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:K3');
    const periodCell = worksheet.getCell('A3');
    periodCell.value = `Period: ${dateFrom} to ${dateTo}`;
    periodCell.alignment = { horizontal: 'center' };

    // Spacer
    worksheet.addRow([]);

    // Main Header Row (Market Potential)
    const marketPotentialRowIdx = 5;
    const marketPotentialEndCol = 1 + (categories.length * 2);
    worksheet.mergeCells(marketPotentialRowIdx, 2, marketPotentialRowIdx, marketPotentialEndCol);
    const mpHeader = worksheet.getCell(marketPotentialRowIdx, 2);
    mpHeader.value = 'Market Potential';
    mpHeader.alignment = { horizontal: 'center' };
    mpHeader.font = { bold: true };
    setBorder(mpHeader);

    // Category Header Row
    const catRowIdx = 6;
    
    // Crop Header (Vertical Merge)
    worksheet.mergeCells(catRowIdx, 1, catRowIdx + 1, 1);
    const cropHeader = worksheet.getCell(catRowIdx, 1);
    cropHeader.value = 'Crop';
    cropHeader.alignment = { vertical: 'middle', horizontal: 'center' };
    cropHeader.font = { bold: true };
    setBorder(cropHeader);
    setBorder(worksheet.getCell(catRowIdx + 1, 1));

    categories.forEach((cat, i) => {
      const colIdx = 2 + (i * 2);
      worksheet.mergeCells(catRowIdx, colIdx, catRowIdx, colIdx + 1);
      const cell = worksheet.getCell(catRowIdx, colIdx);
      cell.value = cat.name;
      cell.alignment = { horizontal: 'center' };
      cell.font = { bold: true };
      setBorder(cell);
      setBorder(worksheet.getCell(catRowIdx, colIdx + 1));
    });

    // Metrics Row (Volume, Value)
    const metricRowIdx = 7;
    categories.forEach((_, i) => {
      const colIdx = 2 + (i * 2);
      const volCell = worksheet.getCell(metricRowIdx, colIdx);
      const valCell = worksheet.getCell(metricRowIdx, colIdx + 1);
      volCell.value = 'Volume';
      valCell.value = 'Value (₱)';
      volCell.font = { size: 9, bold: true };
      valCell.font = { size: 9, bold: true };
      volCell.alignment = { horizontal: 'center' };
      valCell.alignment = { horizontal: 'center' };
      setBorder(volCell);
      setBorder(valCell);
    });

    // Data Rows
    let currentRowIdx = 8;
    categoriesInMaster.forEach(catGroup => {
      const sortedCrops = cropsByCategory[catGroup].sort();
      if (sortedCrops.length === 0) return;

      const isNumberedGroup = catGroup === "Vegetables" || catGroup === "Others";

      if (isNumberedGroup) {
        const headerRow = worksheet.getRow(currentRowIdx++);
        const headerCell = headerRow.getCell(1);
        headerCell.value = catGroup === "Vegetables" ? "Veg" : "Other Crops";
        headerCell.font = { bold: true };
        setBorder(headerCell);
        for(let i=0; i < categories.length * 2; i++) {
            setBorder(headerRow.getCell(2 + i));
        }
      }

      sortedCrops.forEach((cropName, index) => {
        const row = worksheet.getRow(currentRowIdx++);
        const labelCell = row.getCell(1);
        
        // Display logic: Number + Name if in numbered group, Else just Name
        labelCell.value = isNumberedGroup ? `${index + 1}. ${cropName}` : cropName;
        labelCell.alignment = { horizontal: 'left' };
        setBorder(labelCell);

        categories.forEach((cat, catIdx) => {
          const entry = lookup[cropName]?.[cat.name];
          const volCell = row.getCell(2 + (catIdx * 2));
          const valCell = row.getCell(3 + (catIdx * 2));
          
          volCell.value = entry ? Number(entry.volume) : 0;
          valCell.value = entry ? Number(entry.value) : 0;
          
          volCell.numFmt = '#,##0';
          valCell.numFmt = '₱#,##0';
          
          setBorder(volCell);
          setBorder(valCell);
        });
      });
    });

    // Grand Totals Row
    const totalRow = worksheet.getRow(currentRowIdx);
    const totalLabel = totalRow.getCell(1);
    totalLabel.value = 'Grand Total';
    totalLabel.font = { bold: true };
    setBorder(totalLabel);

    categories.forEach((cat, i) => {
      const volCell = totalRow.getCell(2 + (i * 2));
      const valCell = totalRow.getCell(3 + (i * 2));
      volCell.value = totals[cat.name].volume;
      valCell.value = totals[cat.name].value;
      volCell.font = { bold: true };
      volCell.font = { bold: true };
      volCell.numFmt = '#,##0';
      valCell.numFmt = '₱#,##0';
      setBorder(volCell);
      setBorder(valCell);
    });

    // Column widths
    worksheet.getColumn(1).width = 30;
    for (let i = 0; i < categories.length * 2; i++) {
      worksheet.getColumn(2 + i).width = 15;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Market_Potential_Report_${dateFrom}_to_${dateTo}.xlsx`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9] min-h-screen"
    >
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
              <Button 
                onClick={handleExportExcel}
                className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gradient-to-r from-gray-50 to-gray-50/50 p-5 rounded-2xl border border-gray-100">

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

            <div className="flex items-end gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] shadow-md shadow-green-500/20 rounded-xl"
                onClick={fetchReportData}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
                Apply Report
              </Button>
              <Button variant="outline" className="px-3 bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-600 rounded-xl transition-all duration-300" onClick={() => { setDateFrom(firstDay); setDateTo(lastDay); }}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Report preview bar */}
        <div className="px-6 py-3 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Report: {dateFrom} → {dateTo}
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th rowSpan={2} className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-bold border-r border-gray-100 bg-gray-50/80 min-w-[200px] sticky left-0 z-10">
                  Crop Distribution
                </th>
                {categories.map((cat) => (
                  <th key={cat.name} colSpan={2} className="px-0 py-0 border-r border-gray-100">
                    <div className={`bg-gradient-to-r ${cat.color} text-white px-4 py-3 text-center text-[10px] uppercase tracking-widest font-bold`}>
                      {cat.name}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50/50">
                {categories.map((cat) => (
                  <React.Fragment key={`${cat.name}-sub`}>
                    <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-50">Vol</th>
                    <th className="px-4 py-2.5 text-center text-[9px] uppercase tracking-widest text-gray-400 font-bold border-r border-gray-100">Val (₱)</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <tr key={`skeleton-${i}`} className="border-b border-gray-50">
                        <td className="px-6 py-4 border-r border-gray-100 sticky left-0 bg-white z-10"><Skeleton className="h-4 w-32" /></td>
                        {categories.map((cat) => (
                          <React.Fragment key={`${i}-${cat.name}`}>
                            <td className="px-4 py-3.5 text-center border-r border-gray-50"><Skeleton className="h-4 w-12 mx-auto" /></td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-100"><Skeleton className="h-4 w-16 mx-auto" /></td>
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </>
                ) : (
                  <>
                    {categoriesInMaster.map((catGroup) => {
                      const sortedCrops = cropsByCategory[catGroup].sort();
                      if (sortedCrops.length === 0) return null;
                      return (
                        <React.Fragment key={catGroup}>
                          <tr className="bg-gray-100/30">
                            <td colSpan={1 + categories.length * 2} className="px-6 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 italic font-medium">
                              {catGroup === "Others" ? "Other Crops" : catGroup}
                            </td>
                          </tr>
                          {sortedCrops.map((cropName, idx) => (
                            <motion.tr 
                              key={cropName}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b border-gray-50 hover:bg-green-50/20 transition-colors"
                            >
                              <td className="px-6 py-3.5 text-sm font-semibold text-gray-800 border-r border-gray-100 sticky left-0 bg-white z-10">
                                {cropName}
                              </td>
                              {categories.map((cat) => {
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
                            </motion.tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </AnimatePresence>
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold border-r border-gray-700 sticky left-0 bg-gray-800 z-10">Grand Total</td>
                {categories.map((cat) => (
                  <React.Fragment key={`${cat.name}-total`}>
                    <td className="px-4 py-4 text-center text-sm font-bold border-r border-gray-700/50 tabular-nums">
                      {loading ? <Skeleton className="h-4 w-12 bg-gray-700 mx-auto" /> : (totals[cat.name]?.volume || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-green-400 border-r border-gray-700 tabular-nums">
                      {loading ? <Skeleton className="h-4 w-16 bg-gray-700 mx-auto" /> : `₱${(totals[cat.name]?.value || 0).toLocaleString()}`}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        </div>


      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-gray-400 px-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          Live data from Supabase
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest">GenTrade Territory Intelligence v1.0</p>
      </div>
    </motion.div>
  );
}
