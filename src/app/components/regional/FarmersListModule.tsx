import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Users, Search, ChevronDown, ChevronRight, Loader2, Trash2, Pencil, X, Check, Save } from "lucide-react";

interface FarmersListModuleProps {
  user: any;
  barangays: any[];
  products: string[];
  municipalityCode: string;
  [key: string]: any;
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 40, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "0 12px",
  fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fafafa",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4, display: "block",
  textTransform: "uppercase", letterSpacing: "0.5px",
};

export function FarmersListModule({ user, barangays, products, municipalityCode }: FarmersListModuleProps) {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [landUnitEdit, setLandUnitEdit] = useState<"Ha" | "Sqm">("Ha");
  const [agriUnitEdit, setAgriUnitEdit] = useState<"Ha" | "Sqm">("Ha");

  const fetchFarmers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("regional_farmers")
      .select("*")
      .eq("user_id", user.id)
      .eq("municipality_code", municipalityCode)
      .order("barangay_name")
      .order("last_name");
    setFarmers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFarmers(); }, [municipalityCode]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete farmer "${name}"?`)) return;
    await supabase.from("regional_farmers").delete().eq("id", id);
    fetchFarmers();
  };

  const handleEditStart = (farmer: any) => {
    setEditingId(farmer.id);
    setEditError(null);
    setEditForm({
      barangay_code: farmer.barangay_code || "",
      barangay_name: farmer.barangay_name || "",
      rsbsa_no: farmer.rsbsa_no || "",
      first_name: farmer.first_name || "",
      middle_name: farmer.middle_name || "",
      last_name: farmer.last_name || "",
      crops: farmer.crops ? [...farmer.crops] : [],
      land_area: farmer.land_area?.toString() || "",
      agricultural_land_area: farmer.agricultural_land_area?.toString() || "",
    });
    setLandUnitEdit("Ha");
    setAgriUnitEdit("Ha");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setEditError(null);
  };

  const handleRsbsaChange = (val: string) => {
    let v = val.replace(/\D/g, "").slice(0, 15);
    let f = "";
    if (v.length > 0) f += v.substring(0, 2);
    if (v.length > 2) f += "-" + v.substring(2, 4);
    if (v.length > 4) f += "-" + v.substring(4, 6);
    if (v.length > 6) f += "-" + v.substring(6, 9);
    if (v.length > 9) f += "-" + v.substring(9, 15);
    setEditForm((prev: any) => ({ ...prev, rsbsa_no: f }));
  };

  const handleBarangayChange = (code: string) => {
    const brgy = barangays.find(b => b.code === code);
    setEditForm((prev: any) => ({ ...prev, barangay_code: code, barangay_name: brgy?.name || "" }));
  };

  const toggleEditCrop = (crop: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter((c: string) => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleEditSave = async (farmerId: string) => {
    if (!editForm.first_name || !editForm.last_name || !editForm.barangay_code) {
      setEditError("First name, last name, and barangay are required.");
      return;
    }
    setIsSaving(true);
    setEditError(null);
    const { error } = await supabase.from("regional_farmers").update({
      barangay_code: editForm.barangay_code,
      barangay_name: editForm.barangay_name,
      rsbsa_no: editForm.rsbsa_no,
      first_name: editForm.first_name,
      middle_name: editForm.middle_name,
      last_name: editForm.last_name,
      crops: editForm.crops,
      land_area: editForm.land_area ? Number(editForm.land_area) : 0,
      agricultural_land_area: editForm.agricultural_land_area ? Number(editForm.agricultural_land_area) : 0,
    }).eq("id", farmerId);
    setIsSaving(false);
    if (error) { setEditError(error.message); return; }
    setEditingId(null);
    setEditForm(null);
    fetchFarmers();
  };

  // Group by barangay
  const grouped: Record<string, any[]> = {};
  barangays.forEach(b => { grouped[b.name] = []; });

  const filteredFarmers = farmers.filter(f => {
    const q = search.toLowerCase();
    return f.first_name?.toLowerCase().includes(q) || f.last_name?.toLowerCase().includes(q) ||
      f.barangay_name?.toLowerCase().includes(q) || f.rsbsa_no?.toLowerCase().includes(q);
  });
  filteredFarmers.forEach(f => {
    const key = f.barangay_name || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  const toggleExpand = (brgy: string) => setExpanded(prev => ({ ...prev, [brgy]: !prev[brgy] }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, boxShadow: "0 8px 32px rgba(34,197,94,0.25)", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={26} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Farmers per Barangay</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>View, edit and manage registered farmers grouped by barangay</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Total Farmers", value: filteredFarmers.length },
              { label: "Barangays", value: Object.keys(grouped).length },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search farmers by name, RSBSA, or barangay..."
              style={{ width: "100%", height: 44, paddingLeft: 42, paddingRight: 14, border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
          </div>
          <select
            value={selectedBarangay}
            onChange={e => setSelectedBarangay(e.target.value)}
            style={{ width: 240, height: 44, padding: "0 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff", cursor: "pointer", color: "#374151" }}
          >
            <option value="All">All Barangays</option>
            {barangays.map(b => (
              <option key={b.code} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}><Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 12px" }} /><p>Loading...</p></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "48px", textAlign: "center", color: "#9ca3af", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No barangays found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(grouped)
              .filter(([brgy]) => selectedBarangay === "All" || brgy === selectedBarangay)
              .sort().map(([brgy, list]) => (
              <div key={brgy} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                <button onClick={() => toggleExpand(brgy)}
                  style={{ width: "100%", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(34,197,94,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={16} style={{ color: "#16a34a" }} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{brgy}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{list.length} farmer{list.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  {expanded[brgy] ? <ChevronDown size={18} style={{ color: "#9ca3af" }} /> : <ChevronRight size={18} style={{ color: "#9ca3af" }} />}
                </button>

                {expanded[brgy] && (
                  <div style={{ borderTop: "1px solid #f3f4f6" }}>
                    {list.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No farmers registered in this barangay.</div>
                    ) : (
                      <div>
                        {/* Table header */}
                        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr auto", background: "#f9fafb", padding: "10px 16px", gap: 8 }}>
                          {["Barangay", "Name", "Crops", ""].map(h => (
                            <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
                          ))}
                        </div>

                        {list.map(f => (
                          <div key={f.id}>
                            {/* Normal row */}
                            {editingId !== f.id && (
                              <div
                                style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr auto", padding: "12px 16px", gap: 8, borderTop: "1px solid #f9fafb", alignItems: "center", transition: "background 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <div style={{ color: "#6b7280", fontSize: 13 }}>{f.barangay_name || "—"}</div>
                                <div style={{ fontWeight: 500, color: "#111827", fontSize: 13 }}>
                                  {f.last_name}, {f.first_name}{f.middle_name ? ` ${f.middle_name.charAt(0)}.` : ""}
                                  {f.rsbsa_no && <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginTop: 2 }}>{f.rsbsa_no}</div>}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {(f.crops || []).length === 0 ? (
                                    <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                                  ) : (f.crops || []).map((c: string) => (
                                    <span key={c} style={{ padding: "2px 10px", background: "rgba(34,197,94,0.1)", color: "#16a34a", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{c}</span>
                                  ))}
                                </div>
                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                  {/* Edit button */}
                                  <button
                                    onClick={() => handleEditStart(f)}
                                    title="Edit farmer"
                                    style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, transition: "all 0.15s" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#d1d5db"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleDelete(f.id, `${f.first_name} ${f.last_name}`)}
                                    title="Delete farmer"
                                    style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, transition: "all 0.15s" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#d1d5db"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Inline edit panel */}
                            {editingId === f.id && editForm && (
                              <div style={{ borderTop: "2px solid #22c55e", background: "linear-gradient(135deg, rgba(34,197,94,0.03) 0%, rgba(255,255,255,1) 100%)", padding: 24 }}>
                                {/* Edit panel header */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Pencil size={13} color="#fff" />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Edit Farmer</span>
                                  </div>
                                  <button onClick={handleEditCancel} style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                                    <X size={14} />
                                  </button>
                                </div>

                                {editError && (
                                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
                                    {editError}
                                  </div>
                                )}

                                {/* Location */}
                                <div style={{ marginBottom: 16 }}>
                                  <label style={labelStyle}>Barangay *</label>
                                  <select
                                    value={editForm.barangay_code}
                                    onChange={e => handleBarangayChange(e.target.value)}
                                    style={{ ...inputStyle, cursor: "pointer" }}
                                  >
                                    <option value="">Select Barangay</option>
                                    {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                  </select>
                                </div>

                                {/* Name fields */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                                  <div>
                                    <label style={labelStyle}>First Name *</label>
                                    <input style={inputStyle} value={editForm.first_name} onChange={e => setEditForm((p: any) => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Middle Name</label>
                                    <input style={inputStyle} value={editForm.middle_name} onChange={e => setEditForm((p: any) => ({ ...p, middle_name: e.target.value }))} placeholder="Middle name" />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Last Name *</label>
                                    <input style={inputStyle} value={editForm.last_name} onChange={e => setEditForm((p: any) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
                                  </div>
                                </div>

                                {/* RSBSA & Areas */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                                  <div>
                                    <label style={labelStyle}>RSBSA No.</label>
                                    <input style={inputStyle} value={editForm.rsbsa_no} onChange={e => handleRsbsaChange(e.target.value)} placeholder="09-001-001-000001" />
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <label style={{ ...labelStyle, marginBottom: 0 }}>Land Area</label>
                                      <select value={landUnitEdit} onChange={e => setLandUnitEdit(e.target.value as any)}
                                        style={{ border: "1.5px solid #e5e7eb", borderRadius: 6, fontSize: 9, fontWeight: 700, padding: "1px 2px", background: "#fff", cursor: "pointer", color: "#16a34a" }}>
                                        <option value="Ha">HA</option>
                                        <option value="Sqm">SQM</option>
                                      </select>
                                    </div>
                                    <div style={{ position: "relative" }}>
                                      <input type="number" step="0.0001" style={inputStyle}
                                        value={landUnitEdit === "Sqm" ? (editForm.land_area ? (Number(editForm.land_area) * 10000).toFixed(0) : "") : editForm.land_area}
                                        onChange={e => {
                                          const v = e.target.value;
                                          if (landUnitEdit === "Sqm") setEditForm((p: any) => ({ ...p, land_area: v ? (Number(v) / 10000).toFixed(4) : "" }));
                                          else setEditForm((p: any) => ({ ...p, land_area: v }));
                                        }}
                                        placeholder="0.00"
                                      />
                                      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{landUnitEdit}</div>
                                    </div>
                                    {editForm.land_area && <div style={{ fontSize: 9, color: "#22c55e", marginTop: 2, fontWeight: 500 }}>
                                      = {landUnitEdit === "Sqm" ? `${editForm.land_area} Ha` : `${(Number(editForm.land_area) * 10000).toLocaleString()} sqm`}
                                    </div>}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <label style={{ ...labelStyle, marginBottom: 0 }}>Agri Area</label>
                                      <select value={agriUnitEdit} onChange={e => setAgriUnitEdit(e.target.value as any)}
                                        style={{ border: "1.5px solid #e5e7eb", borderRadius: 6, fontSize: 9, fontWeight: 700, padding: "1px 2px", background: "#fff", cursor: "pointer", color: "#16a34a" }}>
                                        <option value="Ha">HA</option>
                                        <option value="Sqm">SQM</option>
                                      </select>
                                    </div>
                                    <div style={{ position: "relative" }}>
                                      <input type="number" step="0.0001" style={inputStyle}
                                        value={agriUnitEdit === "Sqm" ? (editForm.agricultural_land_area ? (Number(editForm.agricultural_land_area) * 10000).toFixed(0) : "") : editForm.agricultural_land_area}
                                        onChange={e => {
                                          const v = e.target.value;
                                          if (agriUnitEdit === "Sqm") setEditForm((p: any) => ({ ...p, agricultural_land_area: v ? (Number(v) / 10000).toFixed(4) : "" }));
                                          else setEditForm((p: any) => ({ ...p, agricultural_land_area: v }));
                                        }}
                                        placeholder="0.00"
                                      />
                                      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{agriUnitEdit}</div>
                                    </div>
                                    {editForm.agricultural_land_area && <div style={{ fontSize: 9, color: "#22c55e", marginTop: 2, fontWeight: 500 }}>
                                      = {agriUnitEdit === "Sqm" ? `${editForm.agricultural_land_area} Ha` : `${(Number(editForm.agricultural_land_area) * 10000).toLocaleString()} sqm`}
                                    </div>}
                                  </div>
                                </div>

                                {/* Dynamic Crops */}
                                <div style={{ marginBottom: 20 }}>
                                  <label style={labelStyle}>Crops</label>
                                  {products.length === 0 ? (
                                    <div style={{ fontSize: 13, color: "#9ca3af", padding: "12px 0" }}>No products available. Add products first.</div>
                                  ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                                      {products.map(crop => {
                                        const selected = editForm.crops.includes(crop);
                                        return (
                                          <button
                                            key={crop}
                                            type="button"
                                            onClick={() => toggleEditCrop(crop)}
                                            style={{
                                              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                                              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                                              border: selected ? "1.5px solid #22c55e" : "1.5px solid #e5e7eb",
                                              background: selected ? "rgba(34,197,94,0.12)" : "#fff",
                                              color: selected ? "#16a34a" : "#6b7280",
                                              display: "flex", alignItems: "center", gap: 5,
                                            }}
                                          >
                                            {selected && <Check size={11} />}{crop}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: "flex", gap: 10 }}>
                                  <button
                                    onClick={() => handleEditSave(f.id)}
                                    disabled={isSaving}
                                    style={{ flex: 1, height: 40, background: "linear-gradient(135deg,#0f5f2e,#0a4020)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", opacity: isSaving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}
                                  >
                                    {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    style={{ height: 40, padding: "0 20px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
