import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { TrendingUp, Save, Loader2 } from "lucide-react";
import { PeriodSelector, Period, defaultPeriod, periodToQuery, periodLabel } from "./PeriodSelector";

interface VolumeProductionModuleProps {
  user: any;
  regionCode: string;
  municipalityCode: string;
  barangays: any[];
  products: string[];
  [key: string]: any;
}

export function VolumeProductionModule({ user, regionCode, municipalityCode, barangays, products }: VolumeProductionModuleProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod());
  const [data, setData] = useState<Record<string, any>>({});
  const [farmerTotals, setFarmerTotals] = useState<Record<string, { land: number; agri: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!municipalityCode || !user?.id) return;
    setLoading(true);
    const pq = periodToQuery(period);
    Promise.all([
      supabase
        .from("regional_volume_production")
        .select("*")
        .eq("user_id", user.id)
        .eq("municipality_code", municipalityCode)
        .eq("period_type", pq.period_type)
        .eq("report_year", pq.report_year)
        .eq("report_quarter", pq.report_quarter)
        .eq("report_month", pq.report_month),
      supabase
        .from("regional_farmers")
        .select("barangay_code, land_area, agricultural_land_area")
        .eq("user_id", user.id)
        .eq("municipality_code", municipalityCode),
    ]).then(([{ data: rows }, { data: farmers }]) => {
      const map: Record<string, any> = {};
      (rows || []).forEach((row: any) => { map[row.barangay_code] = row; });
      setData(map);

      const totals: Record<string, { land: number; agri: number }> = {};
      (farmers || []).forEach((f: any) => {
        if (!totals[f.barangay_code]) totals[f.barangay_code] = { land: 0, agri: 0 };
        totals[f.barangay_code].land += Number(f.land_area) || 0;
        totals[f.barangay_code].agri += Number(f.agricultural_land_area) || 0;
      });
      setFarmerTotals(totals);
      setLoading(false);
    });
  }, [municipalityCode, user?.id, period.type, period.year, period.quarter, period.month]);

  const setVal = (brgyCode: string, field: string, value: string) => {
    const parsedValue = value === "" ? "" : Number(value);
    if (field === "agri_land_area_ha" && typeof parsedValue === "number") {
      const current = data[brgyCode] || {};
      const cropData = current.crop_data || {};
      let totalCrops = 0;
      products.forEach(p => { totalCrops += Number(cropData[p]) || 0; });
      if (parsedValue < totalCrops) {
        alert(`Cannot decrease Agricultural Land Area below the total declared crops (${totalCrops}). Decrease crops first.`);
        return;
      }
    }
    setData(prev => ({
      ...prev,
      [brgyCode]: { ...prev[brgyCode], [field]: parsedValue }
    }));
  };

  const setCropVal = (brgyCode: string, crop: string, value: string) => {
    const parsedValue = value === "" ? "" : Number(value);
    if (typeof parsedValue === "number" && parsedValue > 0) {
      const current = data[brgyCode] || {};
      const cropData = current.crop_data || {};
      const agriArea = Number(current.agri_land_area_ha) || 0;
      
      if (agriArea === 0) {
        alert("Please declare the Agricultural Land Area first.");
        return;
      }

      let sumOtherCrops = 0;
      products.forEach(p => {
        if (p !== crop) sumOtherCrops += Number(cropData[p]) || 0;
      });
      if (sumOtherCrops + parsedValue > agriArea) {
        alert(`Total cannot exceed Agricultural Land Area (${agriArea}).`);
        return;
      }
    }
    setData(prev => {
      const current = prev[brgyCode] || {};
      const cropData = current.crop_data || {};
      return { ...prev, [brgyCode]: { ...current, crop_data: { ...cropData, [crop]: parsedValue } } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const pq = periodToQuery(period);
    const upsertRows = barangays.map(brgy => {
      const row = data[brgy.code] || {};
      const cropData = row.crop_data || {};
      const total = products.reduce((sum, p) => sum + (Number(cropData[p]) || 0), 0);
      const ft = farmerTotals[brgy.code] || { land: 0, agri: 0 };
      return {
        user_id: user.id, region_code: regionCode, municipality_code: municipalityCode,
        barangay_code: brgy.code, barangay_name: brgy.name,
        ...pq,
        land_area_ha: Number(row.land_area_ha) || 0,
        land_area_ha_farmers: ft.land,
        agri_land_area_ha: Number(row.agri_land_area_ha) || 0,
        agri_land_area_ha_farmers: ft.agri,
        crop_data: cropData,
        total_mt: total,
        updated_at: new Date().toISOString(),
      };
    });
    const { error } = await supabase
      .from("regional_volume_production")
      .upsert(upsertRows, { onConflict: "user_id,barangay_code,period_type,report_year,report_quarter,report_month" });
    if (error) alert("Error: " + error.message);
    else alert(`Volume of production saved for ${periodLabel(period)}!`);
    setSaving(false);
  };

  const inputCls: React.CSSProperties = {
    width: 80, height: 32, border: "1px solid #e5e7eb", borderRadius: 6,
    padding: "0 8px", fontSize: 12, outline: "none", textAlign: "right",
    fontFamily: "inherit", background: "#fff",
  };
  const autoCalcCls: React.CSSProperties = {
    ...inputCls,
    background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)",
    color: "#16a34a", fontWeight: 600, cursor: "not-allowed",
  };
  const thStyle: React.CSSProperties = {
    padding: "12px 10px", color: "#4ade80", fontSize: 11,
    fontWeight: 600, whiteSpace: "nowrap", textAlign: "center",
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 20, padding: "28px 32px", marginBottom: 20, boxShadow: "0 8px 32px rgba(34,197,94,0.25)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Volume of Production (Metric Tons)</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Currently viewing: <strong>{periodLabel(period)}</strong></p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || loading}
          style={{ height: 44, padding: "0 24px", background: "#0f5f2e", color: "#fff", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontFamily: "inherit", boxShadow: "0 4px 18px rgba(0,0,0,0.35)", opacity: saving || loading ? 0.7 : 1 }}>
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save — {periodLabel(period)}</>}
        </button>
      </div>

      {/* Period selector */}
      <div style={{ marginBottom: 16 }}>
        <PeriodSelector value={period} onChange={setPeriod} label="Select Period" />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", background: "#fff", borderRadius: 16 }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 12px" }} />
          <p>Loading data for {periodLabel(period)}...</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#1a2e1a" }}>
                  <th style={{ ...thStyle, textAlign: "left", position: "sticky", left: 0, background: "#1a2e1a", zIndex: 2, paddingLeft: 16, borderRight: "2px solid rgba(74,222,128,0.2)" }}>
                    Name of Barangay
                  </th>
                  <th style={thStyle}>Land Area (Ha)</th>
                  <th style={{ width: 0, padding: 0 }} /> {/* Spacer */}
                  <th style={{ ...thStyle, background: "#0d2210" }}>Land Area (Farmers)</th>
                  <th style={thStyle}>Agri. Land Area (Ha)</th>
                  <th style={{ width: 0, padding: 0 }} /> {/* Spacer */}
                  <th style={{ ...thStyle, background: "#0d2210" }}>Agri. Area (Farmers)</th>
                  {products.map(p => (
                    <th key={p} style={thStyle}>{p} (MT)</th>
                  ))}
                  <th style={{ ...thStyle, background: "#0f1f0f" }}>TOTAL (MT)</th>
                </tr>
              </thead>
              <tbody>
                {barangays.map((brgy, i) => {
                  const row = data[brgy.code] || {};
                  const cropData = row.crop_data || {};
                  const total = products.reduce((sum, p) => sum + (Number(cropData[p]) || 0), 0);
                  const bg = i % 2 === 0 ? "#fff" : "#f9fafb";
                  return (
                    <tr key={brgy.code} style={{ background: bg, borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", position: "sticky", left: 0, background: bg, zIndex: 1, borderRight: "2px solid #e5e7eb" }}>
                        {brgy.name}
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        {(() => {
                          const manual = Number(row.land_area_ha) || 0;
                          const auto = (farmerTotals[brgy.code] || { land: 0 }).land;
                          const diff = Math.abs(manual - auto) > 0.01;
                          return (
                            <input type="number" step="0.01" 
                              style={{ ...inputCls, borderColor: diff ? "#ef4444" : "#e5e7eb", background: diff ? "#fef2f2" : "#fff" }} 
                              value={row.land_area_ha ?? ""} 
                              onChange={e => setVal(brgy.code, "land_area_ha", e.target.value)} 
                              title={diff ? `Discrepancy: ${manual.toFixed(2)} vs Farmer Total ${auto.toFixed(2)}` : ""}
                            />
                          );
                        })()}
                      </td>
                      <td style={{ padding: 0, position: "relative", width: 0 }}>
                        {(() => {
                          const diff = (Number(row.land_area_ha) || 0) - (farmerTotals[brgy.code]?.land || 0);
                          if (Math.abs(diff) < 0.01) return null;
                          return (
                            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translate(-50%, -50%)", background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "6px 10px", background: i % 2 === 0 ? "rgba(34,197,94,0.04)" : "rgba(34,197,94,0.06)" }}>
                        <input type="number" readOnly style={autoCalcCls} value={(farmerTotals[brgy.code]?.land || 0).toFixed(2)} title="Auto-calculated from farmers" />
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        {(() => {
                          const manual = Number(row.agri_land_area_ha) || 0;
                          const auto = (farmerTotals[brgy.code] || { agri: 0 }).agri;
                          const diff = Math.abs(manual - auto) > 0.01;
                          return (
                            <input type="number" step="0.01" 
                              style={{ ...inputCls, borderColor: diff ? "#ef4444" : "#e5e7eb", background: diff ? "#fef2f2" : "#fff" }} 
                              value={row.agri_land_area_ha ?? ""} 
                              onChange={e => setVal(brgy.code, "agri_land_area_ha", e.target.value)} 
                              title={diff ? `Discrepancy: ${manual.toFixed(2)} vs Farmer Total ${auto.toFixed(2)}` : ""}
                            />
                          );
                        })()}
                      </td>
                      <td style={{ padding: 0, position: "relative", width: 0 }}>
                        {(() => {
                          const diff = (Number(row.agri_land_area_ha) || 0) - (farmerTotals[brgy.code]?.agri || 0);
                          if (Math.abs(diff) < 0.01) return null;
                          return (
                            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translate(-50%, -50%)", background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "6px 10px", background: i % 2 === 0 ? "rgba(34,197,94,0.04)" : "rgba(34,197,94,0.06)" }}>
                        <input type="number" readOnly style={autoCalcCls} value={(farmerTotals[brgy.code]?.agri || 0).toFixed(2)} title="Auto-calculated from farmers" />
                      </td>
                      {products.map(p => (
                        <td key={p} style={{ padding: "6px 10px" }}>
                          <input type="number" step="0.01" style={inputCls} value={cropData[p] ?? ""} onChange={e => setCropVal(brgy.code, p, e.target.value)} />
                        </td>
                      ))}
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: "#16a34a", textAlign: "right", whiteSpace: "nowrap" }}>
                        {total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {/* Grand totals */}
                <tr style={{ background: "#1a2e1a", position: "sticky", bottom: 0 }}>
                  <td style={{ padding: "12px 16px", color: "#4ade80", fontWeight: 800, fontSize: 12, position: "sticky", left: 0, background: "#1a2e1a", zIndex: 2, borderRight: "2px solid rgba(74,222,128,0.2)" }}>TOTAL</td>
                  {(() => {
                    const tLandHa = barangays.reduce((s, b) => s + (Number((data[b.code] || {}).land_area_ha) || 0), 0);
                    const tLandFarm = barangays.reduce((s, b) => s + (farmerTotals[b.code]?.land || 0), 0);
                    const tAgriHa = barangays.reduce((s, b) => s + (Number((data[b.code] || {}).agri_land_area_ha) || 0), 0);
                    const tAgriFarm = barangays.reduce((s, b) => s + (farmerTotals[b.code]?.agri || 0), 0);
                    const cropSum = products.map(p => barangays.reduce((s, b) => s + (Number(((data[b.code] || {}).crop_data || {})[p]) || 0), 0));
                    const totalAll = cropSum.reduce((s, v) => s + v, 0);
                    return (<>
                      <td style={{ padding: "12px 10px", color: "#4ade80", fontWeight: 700, textAlign: "right" }}>{tLandHa.toFixed(2)}</td>
                      <td style={{ padding: 0, position: "relative", width: 0 }}>
                        {Math.abs(tLandHa - tLandFarm) > 0.01 && (
                          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translate(-50%, -50%)", background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", zIndex: 10 }}>
                            {(tLandHa - tLandFarm).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", color: "#4ade80", fontWeight: 700, textAlign: "right", background: "#0d2210" }}>{tLandFarm.toFixed(2)}</td>
                      <td style={{ padding: "12px 10px", color: "#4ade80", fontWeight: 700, textAlign: "right" }}>{tAgriHa.toFixed(2)}</td>
                      <td style={{ padding: 0, position: "relative", width: 0 }}>
                        {Math.abs(tAgriHa - tAgriFarm) > 0.01 && (
                          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translate(-50%, -50%)", background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", zIndex: 10 }}>
                            {(tAgriHa - tAgriFarm).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", color: "#4ade80", fontWeight: 700, textAlign: "right", background: "#0d2210" }}>{tAgriFarm.toFixed(2)}</td>
                      {cropSum.map((v, i) => <td key={i} style={{ padding: "12px 10px", color: "#4ade80", fontWeight: 700, textAlign: "right" }}>{v.toFixed(2)}</td>)}
                      <td style={{ padding: "12px 16px", color: "#4ade80", fontWeight: 800, textAlign: "right", background: "#0f1f0f" }}>{totalAll.toFixed(2)}</td>
                    </>);
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
