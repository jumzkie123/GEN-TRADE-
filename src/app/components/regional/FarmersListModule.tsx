import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Users, Search, ChevronDown, ChevronRight, Loader2, Trash2 } from "lucide-react";

interface FarmersListModuleProps {
  user: any;
  barangays: any[];
  municipalityCode: string;
  [key: string]: any;
}

export function FarmersListModule({ user, barangays, municipalityCode }: FarmersListModuleProps) {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  // Group by barangay
  const grouped: Record<string, any[]> = {};
  barangays.forEach(b => {
    grouped[b.name] = [];
  });

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
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Number of registered farmers grouped by barangay</p>
            </div>
          </div>
          {/* Summary stats */}
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
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            {["Barangay", "Name", "Crops", ""].map(h => (
                              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {list.map(f => (
                            <tr key={f.id} style={{ borderTop: "1px solid #f9fafb" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{f.barangay_name || "—"}</td>
                              <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111827" }}>{f.last_name}, {f.first_name}{f.middle_name ? ` ${f.middle_name.charAt(0)}.` : ""}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {(f.crops || []).map((c: string) => (
                                    <span key={c} style={{ padding: "2px 10px", background: "rgba(34,197,94,0.1)", color: "#16a34a", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{c}</span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <button onClick={() => handleDelete(f.id, `${f.first_name} ${f.last_name}`)}
                                  style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, transition: "all 0.15s" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "#d1d5db")}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
