import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type PeriodType = "yearly" | "quarterly" | "monthly";

export interface Period {
  type: PeriodType;
  year: number;
  quarter: number; // 0 = N/A, 1-4
  month: number;   // 0 = N/A, 1-12
}

interface PeriodSelectorProps {
  value: Period;
  onChange: (p: Period) => void;
  label?: string;
}

const QUARTERS = [
  { value: 1, label: "Q1 (Jan–Mar)" },
  { value: 2, label: "Q2 (Apr–Jun)" },
  { value: 3, label: "Q3 (Jul–Sep)" },
  { value: 4, label: "Q4 (Oct–Dec)" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
// 40-year window: 10 years back, 29 years forward — no artificial cap
const YEARS = Array.from({ length: 40 }, (_, i) => currentYear - 10 + i);

const selectStyle: React.CSSProperties = {
  height: 40, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0 12px",
  fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fff",
  cursor: "pointer", color: "#374151", appearance: "none" as any,
  paddingRight: 32,
};

export function PeriodSelector({ value, onChange, label = "Period" }: PeriodSelectorProps) {
  const setType = (type: PeriodType) => {
    onChange({ type, year: value.year, quarter: type === "quarterly" ? 1 : 0, month: type === "monthly" ? 1 : 0 });
  };

  const periodLabel = () => {
    if (value.type === "yearly") return `FY ${value.year}`;
    if (value.type === "quarterly") return `${value.year} Q${value.quarter}`;
    return `${MONTHS[value.month - 1]} ${value.year}`;
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, background: "rgba(34,197,94,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={16} style={{ color: "#16a34a" }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{periodLabel()}</div>
        </div>
      </div>

      <div style={{ height: 28, width: 1, background: "#e5e7eb" }} />

      {/* Period type tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["monthly", "quarterly", "yearly"] as PeriodType[]).map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{
              height: 34, padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all 0.15s",
              background: value.type === t ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#f3f4f6",
              color: value.type === t ? "#fff" : "#6b7280",
              boxShadow: value.type === t ? "0 2px 8px rgba(34,197,94,0.25)" : "none",
              textTransform: "capitalize",
            }}>
            {t === "yearly" ? "Fiscal Year" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ height: 28, width: 1, background: "#e5e7eb" }} />

      {/* Year selector */}
      <div style={{ position: "relative" }}>
        <select value={value.year} onChange={e => onChange({ ...value, year: Number(e.target.value) })} style={selectStyle}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
      </div>

      {/* Quarter selector */}
      {value.type === "quarterly" && (
        <div style={{ position: "relative" }}>
          <select value={value.quarter} onChange={e => onChange({ ...value, quarter: Number(e.target.value) })} style={selectStyle}>
            {QUARTERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
        </div>
      )}

      {/* Month selector */}
      {value.type === "monthly" && (
        <div style={{ position: "relative" }}>
          <select value={value.month} onChange={e => onChange({ ...value, month: Number(e.target.value) })} style={selectStyle}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
        </div>
      )}
    </div>
  );
}

export function defaultPeriod(): Period {
  return { type: "yearly", year: new Date().getFullYear(), quarter: 0, month: 0 };
}

export function periodToQuery(p: Period) {
  return { period_type: p.type, report_year: p.year, report_quarter: p.quarter, report_month: p.month };
}

export function periodLabel(p: Period): string {
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (p.type === "yearly") return `FY ${p.year}`;
  if (p.type === "quarterly") return `${p.year} Q${p.quarter}`;
  return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
}
