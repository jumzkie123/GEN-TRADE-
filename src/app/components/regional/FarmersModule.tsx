import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { UserPlus, Loader2, X, Check } from "lucide-react";

interface FarmersModuleProps {
  user: any;
  barangays: any[];
  products: string[];
  municipalityCode: string;
  [key: string]: any;
}

const emptyForm = {
  barangay_code: "", barangay_name: "",
  rsbsa_no: "", first_name: "", middle_name: "", last_name: "",
  crops: [] as string[], land_area: "", agricultural_land_area: "",
};

export function FarmersModule({ user, barangays, products, municipalityCode }: FarmersModuleProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleRsbsaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 15);
    let formatted = "";
    if (val.length > 0) formatted += val.substring(0, 2);
    if (val.length > 2) formatted += "-" + val.substring(2, 4);
    if (val.length > 4) formatted += "-" + val.substring(4, 6);
    if (val.length > 6) formatted += "-" + val.substring(6, 9);
    if (val.length > 9) formatted += "-" + val.substring(9, 15);
    setField("rsbsa_no", formatted);
  };

  const toggleCrop = (crop: string) => {
    setForm(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleBarangayChange = (code: string) => {
    const brgy = barangays.find(b => b.code === code);
    setField("barangay_code", code);
    setField("barangay_name", brgy?.name || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.barangay_code || !form.first_name || !form.last_name) {
      setError("Please fill in required fields."); return;
    }
    setIsSaving(true); setError(null);
    const { error: dbErr } = await supabase.from("regional_farmers").insert({
      user_id: user.id,
      municipality_code: municipalityCode,
      barangay_code: form.barangay_code,
      barangay_name: form.barangay_name,
      rsbsa_no: form.rsbsa_no,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      crops: form.crops,
      land_area: form.land_area ? Number(form.land_area) : 0,
      agricultural_land_area: form.agricultural_land_area ? Number(form.agricultural_land_area) : 0,
    });
    if (dbErr) { setError(dbErr.message); setIsSaving(false); return; }
    setSuccess(true);
    setForm({ ...emptyForm });
    setTimeout(() => setSuccess(false), 3000);
    setIsSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 44, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0 14px",
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fafafa",
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, boxShadow: "0 8px 32px rgba(34,197,94,0.25)", color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserPlus size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Add Farmer</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Register a new farmer with their barangay and crop information</p>
          </div>
        </div>

        {success && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#16a34a", fontSize: 14, fontWeight: 500 }}>
            <Check size={18} /> Farmer added successfully!
          </div>
        )}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#374151", paddingBottom: 12, borderBottom: "1px solid #f3f4f6" }}>Location</h3>
            <div>
              <label style={labelStyle}>Barangay *</label>
              <select value={form.barangay_code} onChange={e => handleBarangayChange(e.target.value)} required
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select Barangay</option>
                {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#374151", paddingBottom: 12, borderBottom: "1px solid #f3f4f6" }}>Farmer Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>RSBSA No.</label>
                <input style={inputStyle} value={form.rsbsa_no} onChange={handleRsbsaChange} placeholder="e.g. 09-001-001-000001" />
              </div>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} value={form.first_name} onChange={e => setField("first_name", e.target.value)} required placeholder="First name" />
              </div>
              <div>
                <label style={labelStyle}>Middle Name</label>
                <input style={inputStyle} value={form.middle_name} onChange={e => setField("middle_name", e.target.value)} placeholder="Middle name" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} value={form.last_name} onChange={e => setField("last_name", e.target.value)} required placeholder="Last name" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Land Area (Ha)</label>
                <input type="number" step="0.01" style={inputStyle} value={form.land_area} onChange={e => setField("land_area", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Agricultural Land Area (Ha)</label>
                <input type="number" step="0.01" style={inputStyle} value={form.agricultural_land_area} onChange={e => setField("agricultural_land_area", e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600, color: "#374151" }}>Crops</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9ca3af" }}>Select all crops this farmer grows</p>
            {products.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: 13, background: "#f9fafb", borderRadius: 10 }}>
                No products available. Add products first.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {products.map(crop => {
                  const selected = form.crops.includes(crop);
                  return (
                    <button key={crop} type="button" onClick={() => toggleCrop(crop)}
                      style={{
                        padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                        border: selected ? "1.5px solid #22c55e" : "1.5px solid #e5e7eb",
                        background: selected ? "rgba(34,197,94,0.1)" : "#fff",
                        color: selected ? "#16a34a" : "#6b7280",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {selected && <Check size={13} />}{crop}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={isSaving}
            style={{ width: "100%", height: 50, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(34,197,94,0.3)", opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><UserPlus size={18} /> Register Farmer</>}
          </button>
        </form>
      </div>
    </div>
  );
}
