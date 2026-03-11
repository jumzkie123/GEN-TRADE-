import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { FileText, Download, Loader2, Users, BarChart2, TrendingUp } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PeriodSelector, Period, defaultPeriod, periodToQuery, periodLabel } from "./PeriodSelector";

interface ReportsModuleProps {
  user: any;
  regionCode: string;
  municipalityCode: string;
  barangays: any[];
  products: string[];
  municipalityName: string;
  [key: string]: any;
}

type TabId = "farmers" | "production" | "volume";

export function ReportsModule({ user, regionCode, municipalityCode, barangays, products, municipalityName }: ReportsModuleProps) {
  const [activeTab, setActiveTab] = useState<TabId>("farmers");
  const [period, setPeriod] = useState<Period>(defaultPeriod());

  const [farmers, setFarmers] = useState<any[]>([]);
  const [productionData, setProductionData] = useState<Record<string, any>>({});
  const [volumeData, setVolumeData] = useState<Record<string, any>>({});
  const [demographicsData, setDemographicsData] = useState<Record<string, any>>({});
  const [farmerLandTotals, setFarmerLandTotals] = useState<Record<string, { land: number; agri: number }>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const year = period.year;

  useEffect(() => {
    if (!user?.id || !municipalityCode) return;
    setLoading(true);
    const pq = periodToQuery(period);

    Promise.all([
      // Farmers are not period-filtered
      supabase.from("regional_farmers").select("*")
        .eq("user_id", user.id).eq("municipality_code", municipalityCode)
        .order("barangay_name").order("last_name"),
      // Production area filtered by period
      supabase.from("regional_production_areas").select("*")
        .eq("user_id", user.id).eq("municipality_code", municipalityCode)
        .eq("period_type", pq.period_type).eq("report_year", pq.report_year)
        .eq("report_quarter", pq.report_quarter).eq("report_month", pq.report_month),
      // Volume filtered by period
      supabase.from("regional_volume_production").select("*")
        .eq("user_id", user.id).eq("municipality_code", municipalityCode)
        .eq("period_type", pq.period_type).eq("report_year", pq.report_year)
        .eq("report_quarter", pq.report_quarter).eq("report_month", pq.report_month),
      // Demographics filtered by period
      supabase.from("regional_demographics").select("*")
        .eq("user_id", user.id).eq("municipality_code", municipalityCode)
        .eq("period_type", pq.period_type).eq("report_year", pq.report_year)
        .eq("report_quarter", pq.report_quarter).eq("report_month", pq.report_month),
    ]).then(([f, p, v, d]) => {
      const farmersList = f.data || [];
      setFarmers(farmersList);

      const totals: Record<string, { land: number; agri: number }> = {};
      farmersList.forEach((fm: any) => {
        if (!totals[fm.barangay_code]) totals[fm.barangay_code] = { land: 0, agri: 0 };
        totals[fm.barangay_code].land += Number(fm.land_area) || 0;
        totals[fm.barangay_code].agri += Number(fm.agricultural_land_area) || 0;
      });
      setFarmerLandTotals(totals);

      const pm: Record<string, any> = {};
      (p.data || []).forEach((r: any) => { pm[r.barangay_code] = r; });
      setProductionData(pm);

      const vm: Record<string, any> = {};
      (v.data || []).forEach((r: any) => { vm[r.barangay_code] = r; });
      setVolumeData(vm);

      const dm: Record<string, any> = {};
      (d.data || []).forEach((r: any) => { dm[r.barangay_code] = r; });
      setDemographicsData(dm);

      setLoading(false);
    });
  }, [user?.id, municipalityCode, period.type, period.year, period.quarter, period.month]);

  // Group farmers by barangay CODE
  const farmersByBrgyCode: Record<string, any[]> = {};
  farmers.forEach(f => {
    const k = f.barangay_code;
    if (!k) return;
    if (!farmersByBrgyCode[k]) farmersByBrgyCode[k] = [];
    farmersByBrgyCode[k].push(f);
  });

  const getBrgyStats = (brgyCode: string) => {
    const list = farmersByBrgyCode[brgyCode] || [];
    let land = 0, agri = 0, rsbsa = 0, nonRsbsa = 0;
    const cropCount: Record<string, number> = {};
    products.forEach(p => cropCount[p] = 0);

    list.forEach(f => {
      land += Number(f.land_area) || 0;
      agri += Number(f.agricultural_land_area) || 0;
      if (f.rsbsa_no && f.rsbsa_no.trim().length > 0) rsbsa++; else nonRsbsa++;
      (f.crops || []).forEach((c: string) => {
        if (cropCount[c] !== undefined) cropCount[c]++;
      });
    });

    const demo = demographicsData[brgyCode] || {};
    return {
      land, agri, rsbsa, nonRsbsa, cropCount,
      households: demo.households || 0,
      population: demo.population || 0,
      totalFarmers: list.length
    };
  };

  // --------- EXPORT HELPERS ---------
  const applyHeaderStyle = (cell: ExcelJS.Cell, bgColor = "FF1a2e1a", fgColor = "FF4ade80") => {
    cell.font = { bold: true, color: { argb: fgColor }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  };
  const applyDataStyle = (cell: ExcelJS.Cell, bold = false) => {
    cell.border = { top: { style: "hair" }, left: { style: "hair" }, bottom: { style: "hair" }, right: { style: "hair" } };
    cell.font = { bold, size: 9 };
    cell.alignment = { vertical: "middle" };
  };
  const addReportHeader = (ws: ExcelJS.Worksheet, title: string, colCount: number) => {
    const merge = (row: number, val: string, bold = false) => {
      ws.getCell(`A${row}`).value = val;
      ws.getCell(`A${row}`).font = { bold, size: bold ? 11 : 10 };
      ws.getCell(`A${row}`).alignment = { horizontal: "center" };
      ws.mergeCells(row, 1, row, colCount);
    };
    merge(1, "Republic of the Philippines");
    merge(2, "Provincial Agriculture Office");
    merge(3, municipalityName || "Municipality");
    merge(4, "MUNICIPAL AGRICULTURE OFFICE");
    ws.addRow([]);
    merge(6, title, true);
    merge(7, `Period: ${periodLabel(period)}`, false);
    ws.addRow([]);
  };

  const exportFarmers = async () => {
    setExporting(true);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Number of Farmers");
    
    const colsCount = 8 + products.length;
    addReportHeader(ws, `NUMBER OF FARMERS CY ${year}`, colsCount);
    
    const headers = [
      "Name of Barangay", "Land Area\n(Ha)", "Agricultural\nLand Area\n(Ha)", 
      "Total no. of\nHouseholds", "Total no. of\nPopulations",
      ...products.map(p => `${p}\nFarmers`),
      "Total\nNumber of\nFarmers", "Total No. of\nRSBSA\nFarmers", "Total No. of\nnon-RSBSA\nFarmers"
    ];
    
    const hr = ws.addRow(headers);
    hr.height = 45;
    hr.eachCell(cell => applyHeaderStyle(cell));
    
    ws.columns = [
      { width: 20 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 14 },
      ...products.map(() => ({ width: 12 })),
      { width: 14 }, { width: 14 }, { width: 14 }
    ];

    let grandLand = 0, grandAgri = 0, grandHH = 0, grandPop = 0;
    const grandCrops: Record<string, number> = {};
    products.forEach(p => grandCrops[p] = 0);
    let grandTotFarm = 0, grandRSBSA = 0, grandNonRSBSA = 0;

    barangays.forEach((brgy, i) => {
      const stats = getBrgyStats(brgy.code);
      
      grandLand += stats.land; grandAgri += stats.agri;
      grandHH += stats.households; grandPop += stats.population;
      products.forEach(p => grandCrops[p] += stats.cropCount[p]);
      grandTotFarm += stats.totalFarmers; grandRSBSA += stats.rsbsa; grandNonRSBSA += stats.nonRsbsa;

      const rowVals = [
        brgy.name, stats.land, stats.agri, stats.households, stats.population,
        ...products.map(p => stats.cropCount[p]),
        stats.totalFarmers, stats.rsbsa, stats.nonRsbsa
      ];

      const dr = ws.addRow(rowVals);
      const bg = i % 2 === 0 ? "FFf0fdf4" : "FFffffff";
      dr.eachCell((cell, cn) => {
        applyDataStyle(cell);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        if (cn > 1) cell.alignment = { horizontal: "right", vertical: "middle" };
      });
    });

    const totalRowVals = [
      "TOTAL", grandLand, grandAgri, grandHH, grandPop,
      ...products.map(p => grandCrops[p]),
      grandTotFarm, grandRSBSA, grandNonRSBSA
    ];
    const tr = ws.addRow(totalRowVals);
    tr.eachCell((cell, cn) => {
      applyHeaderStyle(cell, "FF1a2e1a", "FF4ade80");
      if (cn > 1) cell.alignment = { horizontal: "right", vertical: "middle" };
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Number_of_Farmers_${municipalityName}_${periodLabel(period).replace(/\s/g, "_")}.xlsx`);
    setExporting(false);
  };

  const exportProductionArea = async () => {
    setExporting(true);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Production Area per Barangay");
    const cols = 5 + products.length + 1;
    addReportHeader(ws, `PRODUCTION AREA BY BARANGAY (Ha) CY ${year}`, cols);
    const headers = ["Name of Barangay", "Land Area (Ha)", "Land Area\n(Farmers)", "Agri. Land\nArea (Ha)", "Agri. Area\n(Farmers)", ...products.map(p => `${p}\n(Ha)`), "TOTAL"];
    const hr = ws.addRow(headers);
    hr.height = 36;
    hr.eachCell(cell => applyHeaderStyle(cell));
    ws.columns = [{ width: 22 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 13 }, ...products.map(() => ({ width: 12 })), { width: 12 }];
    let grandTotal = [0, 0, 0, 0, ...products.map(() => 0), 0];
    barangays.forEach((brgy, i) => {
      const row = productionData[brgy.code] || {};
      const cd = row.crop_data || {};
      const ft = farmerLandTotals[brgy.code] || { land: 0, agri: 0 };
      const cropVals = products.map(p => Number(cd[p]) || 0);
      const total = cropVals.reduce((s, v) => s + v, 0);
      const vals = [brgy.name, Number(row.land_area_ha) || 0, ft.land, Number(row.agri_land_area_ha) || 0, ft.agri, ...cropVals, total];
      const dr = ws.addRow(vals);
      const bg = i % 2 === 0 ? "FFf0fdf4" : "FFffffff";
      dr.eachCell((cell, cn) => {
        applyDataStyle(cell);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: (cn === 3 || cn === 5) ? "FFdcfce7" : bg } };
        if (cn === 3 || cn === 5) cell.font = { bold: true, color: { argb: "FF16a34a" }, size: 9 };
        if (cn > 1) cell.alignment = { horizontal: "right", vertical: "middle" };
      });
      vals.forEach((v, idx) => { if (idx > 0 && typeof v === "number") grandTotal[idx - 1] += v; });
    });
    const tr = ws.addRow(["TOTAL", ...grandTotal]);
    tr.eachCell(cell => applyHeaderStyle(cell, "FF1a2e1a", "FF4ade80"));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Production_Area_${municipalityName}_${periodLabel(period).replace(/\s/g, "_")}.xlsx`);
    setExporting(false);
  };

  const exportVolume = async () => {
    setExporting(true);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Volume of Production");
    const cols = 3 + products.length + 1;
    addReportHeader(ws, `VOLUME OF PRODUCTION (Metric Tons) CY ${year}`, cols);
    const headers = ["Name of Barangay", "Land Area (Ha)", "Agri. Land Area (Ha)", ...products.map(p => `${p} (MT)`), "TOTAL (MT)"];
    ws.addRow([]); ws.addRow([]); ws.addRow([]);
    const hr = ws.addRow(headers);
    hr.font = { bold: true, color: { argb: "FF4ade80" } };
    hr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a2e1a" } };
    ws.columns = [{ width: 22 }, { width: 14 }, { width: 14 }, ...products.map(() => ({ width: 12 })), { width: 12 }];
    let grandTotals = products.map(() => 0);
    let totalLand = 0, totalAgri = 0, grandTotal = 0;
    barangays.forEach((brgy, i) => {
      const row = volumeData[brgy.code] || {};
      const cd = row.crop_data || {};
      const cropVals = products.map(p => Number(cd[p]) || 0);
      const total = cropVals.reduce((s, v) => s + v, 0);
      const landArea = Number(row.land_area_ha) || 0;
      const agriArea = Number(row.agri_land_area_ha) || 0;
      const dr = ws.addRow([brgy.name, landArea, agriArea, ...cropVals, total]);
      const bg = i % 2 === 0 ? "FFf0fdf4" : "FFffffff";
      dr.eachCell((cell, cn) => {
        applyDataStyle(cell);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        if (cn > 1) cell.alignment = { horizontal: "right", vertical: "middle" };
      });
      cropVals.forEach((v, idx) => { grandTotals[idx] += v; });
      totalLand += landArea; totalAgri += agriArea; grandTotal += total;
    });
    const tr = ws.addRow(["TOTAL", totalLand, totalAgri, ...grandTotals, grandTotal]);
    tr.eachCell(cell => applyHeaderStyle(cell, "FF1a2e1a", "FF4ade80"));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Volume_Production_${municipalityName}_${periodLabel(period).replace(/\s/g, "_")}.xlsx`);
    setExporting(false);
  };

  // --------- TAB CONFIG ---------
  const tabs = [
    { id: "farmers" as TabId, label: "Number of Farmers", icon: Users, count: barangays.length, unit: "barangays" },
    { id: "production" as TabId, label: "Production Area", icon: BarChart2, count: Object.keys(productionData).length, unit: "barangays" },
    { id: "volume" as TabId, label: "Volume of Production", icon: TrendingUp, count: Object.keys(volumeData).length, unit: "barangays" },
  ];

  const thStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff",
    background: "#1a2e1a", borderRight: "1px solid rgba(74,222,128,0.15)",
    whiteSpace: "nowrap", textAlign: "center", letterSpacing: "0.3px",
  };
  const tdStyle: React.CSSProperties = {
    padding: "9px 12px", fontSize: 12, color: "#374151",
    borderRight: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6",
    textAlign: "right", whiteSpace: "nowrap",
  };
  const tdFirst: React.CSSProperties = { ...tdStyle, textAlign: "left", fontWeight: 600, position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid #e5e7eb" };
  const tdTotal: React.CSSProperties = { ...tdStyle, fontWeight: 700, color: "#16a34a", background: "#f0fdf4" };

  return (
    <div style={{ padding: 32 }}>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, boxShadow: "0 8px 32px rgba(34,197,94,0.25)", color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={26} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Reports</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Filter by period, preview, and export government-formatted reports</p>
        </div>
      </div>

      {/* Period filter — applies to all tabs */}
      <div style={{ marginBottom: 20 }}>
        <PeriodSelector value={period} onChange={setPeriod} label="Filter by Period" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, minWidth: 160, padding: "14px 20px", borderRadius: 14, border: "none",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                background: active ? "#fff" : "rgba(255,255,255,0.6)",
                boxShadow: active ? "0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 2px #22c55e" : "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(34,197,94,0.12)" : "rgba(0,0,0,0.05)", flexShrink: 0 }}>
                <tab.icon size={18} style={{ color: active ? "#16a34a" : "#9ca3af" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                 <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#16a34a" : "#6b7280" }}>{tab.label}</div>
                 <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{loading ? "…" : tab.count} {tab.unit}</div>
              </div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 64, color: "#9ca3af", background: "#fff", borderRadius: 16 }}>
          <Loader2 className="animate-spin" size={36} style={{ margin: "0 auto 12px" }} />
          <p style={{ margin: 0 }}>Loading data for <strong>{periodLabel(period)}</strong>...</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>

          {/* Report Preview Header */}
          <div style={{ background: "#f8fffe", borderBottom: "1px solid #e5e7eb", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Preview — {periodLabel(period)}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                {activeTab === "farmers" && `NUMBER OF FARMERS CY ${year}`}
                {activeTab === "production" && `PRODUCTION AREA BY BARANGAY (Ha) CY ${year}`}
                {activeTab === "volume" && `VOLUME OF PRODUCTION (Metric Tons) CY ${year}`}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                Republic of the Philippines · {municipalityName || "Municipality"} · Municipal Agriculture Office
              </div>
            </div>
            <button
              onClick={activeTab === "farmers" ? exportFarmers : activeTab === "production" ? exportProductionArea : exportVolume}
              disabled={exporting}
              style={{ height: 44, padding: "0 22px", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(34,197,94,0.25)", opacity: exporting ? 0.7 : 1, flexShrink: 0 }}
            >
              {exporting ? <><Loader2 size={16} className="animate-spin" /> Exporting...</> : <><Download size={16} /> Export Excel</>}
            </button>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 420px)" }}>

            {/* ===== NUMBER OF FARMERS TAB ===== */}
            {activeTab === "farmers" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "left", position: "sticky", left: 0, zIndex: 6, borderRight: "2px solid rgba(74,222,128,0.3)" }}>Name of Barangay</th>
                    <th style={thStyle}>Land Area<br/>(Ha)</th>
                    <th style={thStyle}>Agri. Land<br/>Area (Ha)</th>
                    <th style={thStyle}>Total no. of<br/>Households</th>
                    <th style={thStyle}>Total no. of<br/>Populations</th>
                    {products.map(p => <th key={p} style={thStyle}>{p}<br/>Farmers</th>)}
                    <th style={{ ...thStyle, background: "#0d2210" }}>Total Number<br/>of Farmers</th>
                    <th style={{ ...thStyle, background: "#0f1f0f" }}>Total No. of<br/>RSBSA Farmers</th>
                    <th style={{ ...thStyle, background: "#0c1b0c" }}>Total No. of<br/>non-RSBSA<br/>Farmers</th>
                  </tr>
                </thead>
                <tbody>
                  {barangays.length === 0 ? (
                    <tr><td colSpan={8 + products.length} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No farmer records found.</td></tr>
                  ) : (
                    <>
                      {barangays.map((brgy, i) => {
                        const stats = getBrgyStats(brgy.code);
                        const bg = i % 2 === 0 ? "#f9fafb" : "#fff";
                        return (
                          <tr key={brgy.code} style={{ background: bg }}>
                            <td style={{ ...tdFirst, background: bg }}>{brgy.name}</td>
                            <td style={tdStyle}>{stats.land.toFixed(2)}</td>
                            <td style={tdStyle}>{stats.agri.toFixed(2)}</td>
                            <td style={{ ...tdStyle, color: "#16a34a", fontWeight: 600 }}>{stats.households}</td>
                            <td style={{ ...tdStyle, color: "#16a34a", fontWeight: 600 }}>{stats.population}</td>
                            {products.map(p => <td key={p} style={tdStyle}>{stats.cropCount[p]}</td>)}
                            <td style={{ ...tdStyle, background: "rgba(34,197,94,0.05)", fontWeight: 700 }}>{stats.totalFarmers}</td>
                            <td style={{ ...tdStyle, background: "rgba(34,197,94,0.1)", color: "#16a34a", fontWeight: 700 }}>{stats.rsbsa}</td>
                            <td style={tdStyle}>{stats.nonRsbsa}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ position: "sticky", bottom: 0 }}>
                        <td style={{ ...tdFirst, background: "#1a2e1a", color: "#4ade80", fontWeight: 800, zIndex: 2 }}>TOTAL</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).land, 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).agri, 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).households, 0)}</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).population, 0)}</td>
                        {products.map(p => (
                          <td key={p} style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).cropCount[p], 0)}</td>
                        ))}
                        <td style={{ ...thStyle, background: "#0d2210", color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).totalFarmers, 0)}</td>
                        <td style={{ ...thStyle, background: "#0f1f0f", color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).rsbsa, 0)}</td>
                        <td style={{ ...thStyle, background: "#0c1b0c", color: "#4ade80" }}>{barangays.reduce((s, b) => s + getBrgyStats(b.code).nonRsbsa, 0)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}

            {/* ===== PRODUCTION AREA TAB ===== */}
            {activeTab === "production" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "left", position: "sticky", left: 0, zIndex: 6, borderRight: "2px solid rgba(74,222,128,0.3)" }}>Name of Barangay</th>
                    <th style={thStyle}>Land Area (Ha)</th>
                    <th style={{ ...thStyle, background: "#0d2210" }}>Land Area (Farmers) ✦</th>
                    <th style={thStyle}>Agri. Land Area (Ha)</th>
                    <th style={{ ...thStyle, background: "#0d2210" }}>Agri. Area (Farmers) ✦</th>
                    {products.map(p => <th key={p} style={thStyle}>{p} (Ha)</th>)}
                    <th style={{ ...thStyle, background: "#0f1f0f" }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {barangays.length === 0 ? (
                    <tr><td colSpan={6 + products.length} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No data for {periodLabel(period)}.</td></tr>
                  ) : (
                    <>
                      {barangays.map((brgy, i) => {
                        const row = productionData[brgy.code] || {};
                        const cd = row.crop_data || {};
                        const cropVals = products.map(p => Number(cd[p]) || 0);
                        const total = cropVals.reduce((s, v) => s + v, 0);
                        const ft = farmerLandTotals[brgy.code] || { land: 0, agri: 0 };
                        const bg = i % 2 === 0 ? "#f9fafb" : "#fff";
                        return (
                          <tr key={brgy.code} style={{ background: bg }}>
                            <td style={{ ...tdFirst, background: bg }}>{brgy.name}</td>
                            <td style={tdStyle}>{row.land_area_ha || "—"}</td>
                            <td style={{ ...tdStyle, background: "rgba(34,197,94,0.07)", color: "#16a34a", fontWeight: 700 }}>{ft.land.toFixed(2)}</td>
                            <td style={tdStyle}>{row.agri_land_area_ha || "—"}</td>
                            <td style={{ ...tdStyle, background: "rgba(34,197,94,0.07)", color: "#16a34a", fontWeight: 700 }}>{ft.agri.toFixed(2)}</td>
                            {cropVals.map((v, ci) => <td key={ci} style={tdStyle}>{v || "—"}</td>)}
                            <td style={tdTotal}>{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ position: "sticky", bottom: 0 }}>
                        <td style={{ ...tdFirst, background: "#1a2e1a", color: "#4ade80", fontWeight: 800, zIndex: 2 }}>TOTAL</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + (Number((productionData[b.code] || {}).land_area_ha) || 0), 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80", background: "#0d2210" }}>{barangays.reduce((s, b) => s + (farmerLandTotals[b.code]?.land || 0), 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + (Number((productionData[b.code] || {}).agri_land_area_ha) || 0), 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80", background: "#0d2210" }}>{barangays.reduce((s, b) => s + (farmerLandTotals[b.code]?.agri || 0), 0).toFixed(2)}</td>
                        {products.map(p => {
                          const sum = barangays.reduce((s, b) => s + (Number(((productionData[b.code] || {}).crop_data || {})[p]) || 0), 0);
                          return <td key={p} style={{ ...thStyle, color: "#4ade80" }}>{sum.toFixed(2)}</td>;
                        })}
                        <td style={{ ...thStyle, background: "#0f1f0f", color: "#4ade80" }}>
                          {barangays.reduce((s, b) => s + products.reduce((ps, p) => ps + (Number(((productionData[b.code] || {}).crop_data || {})[p]) || 0), 0), 0).toFixed(2)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}

            {/* ===== VOLUME OF PRODUCTION TAB ===== */}
            {activeTab === "volume" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "left", position: "sticky", left: 0, zIndex: 6, borderRight: "2px solid rgba(74,222,128,0.3)" }}>Name of Barangay</th>
                    <th style={thStyle}>Land Area (Ha)</th>
                    <th style={thStyle}>Agri. Land Area (Ha)</th>
                    {products.map(p => <th key={p} style={thStyle}>{p} (MT)</th>)}
                    <th style={{ ...thStyle, background: "#0f1f0f", color: "#4ade80" }}>TOTAL (MT)</th>
                  </tr>
                </thead>
                <tbody>
                  {barangays.length === 0 ? (
                    <tr><td colSpan={4 + products.length} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No data for {periodLabel(period)}.</td></tr>
                  ) : (
                    <>
                      {barangays.map((brgy, i) => {
                        const row = volumeData[brgy.code] || {};
                        const cd = row.crop_data || {};
                        const cropVals = products.map(p => Number(cd[p]) || 0);
                        const total = cropVals.reduce((s, v) => s + v, 0);
                        const bg = i % 2 === 0 ? "#f9fafb" : "#fff";
                        return (
                          <tr key={brgy.code} style={{ background: bg }}>
                            <td style={{ ...tdFirst, background: bg }}>{brgy.name}</td>
                            <td style={tdStyle}>{row.land_area_ha || "—"}</td>
                            <td style={tdStyle}>{row.agri_land_area_ha || "—"}</td>
                            {cropVals.map((v, ci) => <td key={ci} style={tdStyle}>{v || "—"}</td>)}
                            <td style={tdTotal}>{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ position: "sticky", bottom: 0 }}>
                        <td style={{ ...tdFirst, background: "#1a2e1a", color: "#4ade80", fontWeight: 800, zIndex: 2 }}>TOTAL</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + (Number((volumeData[b.code] || {}).land_area_ha) || 0), 0).toFixed(2)}</td>
                        <td style={{ ...thStyle, color: "#4ade80" }}>{barangays.reduce((s, b) => s + (Number((volumeData[b.code] || {}).agri_land_area_ha) || 0), 0).toFixed(2)}</td>
                        {products.map(p => {
                          const sum = barangays.reduce((s, b) => s + (Number(((volumeData[b.code] || {}).crop_data || {})[p]) || 0), 0);
                          return <td key={p} style={{ ...thStyle, color: "#4ade80" }}>{sum.toFixed(2)}</td>;
                        })}
                        <td style={{ ...thStyle, background: "#0f1f0f", color: "#4ade80" }}>
                          {barangays.reduce((s, b) => s + products.reduce((ps, p) => ps + (Number(((volumeData[b.code] || {}).crop_data || {})[p]) || 0), 0), 0).toFixed(2)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
