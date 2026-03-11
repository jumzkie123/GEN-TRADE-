import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Save, Loader2, Check, Home, Users } from "lucide-react";
import { PeriodSelector, Period, defaultPeriod, periodToQuery } from "./PeriodSelector";

interface DemographicsModuleProps {
  user: any;
  regionCode: string;
  municipalityCode: string;
  barangays: any[];
  [key: string]: any;
}

export function DemographicsModule({ user, regionCode, municipalityCode, barangays }: DemographicsModuleProps) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>(defaultPeriod());

  const pq = periodToQuery(period);

  useEffect(() => {
    if (!user?.id || !municipalityCode) return;
    setLoading(true);
    supabase
      .from("regional_demographics")
      .select("*")
      .eq("user_id", user.id)
      .eq("municipality_code", municipalityCode)
      .eq("period_type", pq.period_type)
      .eq("report_year", pq.report_year)
      .eq("report_quarter", pq.report_quarter)
      .eq("report_month", pq.report_month)
      .then(({ data: dbData }) => {
        const map: Record<string, any> = {};
        if (dbData) {
          dbData.forEach((row: any) => { map[row.barangay_code] = row; });
        }
        setData(map);
        setLoading(false);
      });
  }, [user?.id, municipalityCode, period.type, period.year, period.quarter, period.month]);

  const handleChange = (brgyCode: string, field: string, val: string) => {
    const num = Math.max(0, parseInt(val) || 0); // Only allow positive integers
    setData(prev => ({
      ...prev,
      [brgyCode]: {
        ...(prev[brgyCode] || {}),
        [field]: num
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const upserts = barangays.map(b => {
      const row = data[b.code] || {};
      return {
        user_id: user.id,
        region_code: regionCode,
        municipality_code: municipalityCode,
        barangay_code: b.code,
        barangay_name: b.name,
        households: row.households || 0,
        population: row.population || 0,
        period_type: pq.period_type,
        report_year: pq.report_year,
        report_quarter: pq.report_quarter,
        report_month: pq.report_month,
      };
    });

    const { error } = await supabase.from("regional_demographics").upsert(upserts, {
      onConflict: "user_id, barangay_code, period_type, report_year, report_quarter, report_month"
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`Data successfully saved for ${period.type} period.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "0 12px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fafafa"
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, boxShadow: "0 8px 32px rgba(34,197,94,0.25)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Home size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Barangay Demographics</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Update the number of households and total population per barangay</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{ height: 44, padding: "0 22px", background: "#fff", color: "#16a34a", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.1)", opacity: saving || loading ? 0.7 : 1 }}
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save All</>}
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <PeriodSelector value={period} onChange={setPeriod} label="Select Period" />
      </div>

      {successMsg && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#16a34a", fontSize: 14, fontWeight: 500 }}>
          <Check size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 64, color: "#9ca3af", background: "#fff", borderRadius: 16 }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 12px" }} />
          <p>Loading data...</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 350px)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#1a2e1a" }}>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#4ade80", borderRight: "1px solid rgba(74,222,128,0.15)", position: "sticky", left: 0, zIndex: 11, background: "#1a2e1a" }}>Name of Barangay</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#4ade80", borderRight: "1px solid rgba(74,222,128,0.15)", minWidth: 150 }}><div style={{display: 'flex', alignItems: 'center', gap: 6}}><Home size={14}/> Total Households</div></th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#4ade80", minWidth: 150 }}><div style={{display: 'flex', alignItems: 'center', gap: 6}}><Users size={14}/> Total Population</div></th>
                </tr>
              </thead>
              <tbody>
                {barangays.map((brgy, i) => {
                  const row = data[brgy.code] || {};
                  return (
                    <tr key={brgy.code} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#f9fafb" : "#fff" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#f9fafb" : "#fff")}>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "#374151", fontSize: 13, borderRight: "1px solid #f3f4f6", position: "sticky", left: 0, zIndex: 1, background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>{brgy.name}</td>
                      <td style={{ padding: "10px 16px", borderRight: "1px solid #f3f4f6" }}>
                        <input type="number" min="0" value={row.households || ""} onChange={e => handleChange(brgy.code, "households", e.target.value)} placeholder="0" style={inputStyle} />
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <input type="number" min="0" value={row.population || ""} onChange={e => handleChange(brgy.code, "population", e.target.value)} placeholder="0" style={inputStyle} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
