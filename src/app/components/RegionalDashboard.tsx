import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Leaf, Package, Users, FileText, BarChart2, LogOut,
  ChevronDown, Settings, Home
} from "lucide-react";
import { ProductsModule } from "./regional/ProductsModule";
import { FarmersModule } from "./regional/FarmersModule";
import { FarmersListModule } from "./regional/FarmersListModule";
import { ProductionAreaModule } from "./regional/ProductionAreaModule";
import { VolumeProductionModule } from "./regional/VolumeProductionModule";
import { DemographicsModule } from "./regional/DemographicsModule";
import { ReportsModule } from "./regional/ReportsModule";
import { motion, AnimatePresence } from "motion/react";

interface RegionalDashboardProps {
  regionCode: string;
  municipalityCode: string;
  user: any;
}

const menuItems = [
  { id: "products", label: "Products", icon: Package },
  { id: "farmers", label: "Add Farmer", icon: Users },
  { id: "farmers-list", label: "Farmers per Barangay", icon: Users },
  { id: "production-area", label: "Production Area", icon: BarChart2 },
  { id: "volume-production", label: "Volume of Production", icon: BarChart2 },
  { id: "demographics", label: "Barangay Demographics", icon: Home },
  { id: "reports", label: "Reports", icon: FileText },
];

export function RegionalDashboard({ regionCode, municipalityCode, user }: RegionalDashboardProps) {
  const [currentPage, setCurrentPage] = useState("products");
  const [barangays, setBarangays] = useState<any[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [municipalityName, setMunicipalityName] = useState("");

  useEffect(() => {
    // Fetch barangays for municipality
    if (municipalityCode) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/barangays/`)
        .then(r => r.json())
        .then(data => setBarangays(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
        .catch(() => {});

      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/`)
        .then(r => r.json())
        .then(data => setMunicipalityName(data.name || ""))
        .catch(() => {});
    }
  }, [municipalityCode]);

  const refreshProducts = () => {
    supabase
      .from("regional_products")
      .select("name")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        if (data) setProducts(data.map((p: any) => p.name));
      });
  };

  useEffect(() => {
    if (user?.id) refreshProducts();
  }, [user?.id]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Regional Partner";

  const renderPage = () => {
    const props = { user, regionCode, municipalityCode, barangays, products, municipalityName };
    switch (currentPage) {
      case "products": return <ProductsModule {...props} onProductsChanged={refreshProducts} />;
      case "farmers": return <FarmersModule {...props} />;
      case "farmers-list": return <FarmersListModule {...props} />;
      case "production-area": return <ProductionAreaModule {...props} />;
      case "volume-production": return <VolumeProductionModule {...props} />;
      case "demographics": return <DemographicsModule {...props} />;
      case "reports": return <ReportsModule {...props} />;
      default: return <ProductsModule {...props} onProductsChanged={refreshProducts} />;
    }
  };

  const pageTitles: Record<string, string> = {
    products: "Products",
    farmers: "Add Farmer",
    "farmers-list": "Farmers per Barangay",
    "production-area": "Production Area by Barangay",
    "volume-production": "Volume of Production",
    demographics: "Barangay Demographics",
    reports: "Reports",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%)" }}>
      {/* SIDEBAR */}
      <div style={{
        width: 260, minWidth: 260, height: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, rgba(10,10,15,0.97) 0%, rgba(12,18,14,0.95) 50%, rgba(10,12,10,0.97) 100%)",
        position: "relative", flexShrink: 0, overflow: "hidden",
      }}>
        {/* Glow orbs */}
        <div style={{ position:"absolute", top:"15%", left:"-30px", width:140, height:140, background:"radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(30px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"20%", right:"-25px", width:100, height:100, background:"radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(25px)", pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ padding:"24px 20px", display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:2 }}>
          <div style={{ width:42, height:42, minWidth:42, background:"linear-gradient(135deg,#22c55e,#16a34a)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 24px rgba(34,197,94,0.35)" }}>
            <Leaf style={{ width:20, height:20, color:"#fff" }} />
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#fff", letterSpacing:1, fontFamily:"'Poppins',sans-serif" }}>GenTrade</div>
            <div style={{ fontSize:10, color:"rgba(74,222,128,0.7)", fontWeight:600, letterSpacing:"2.5px", textTransform:"uppercase" }}>TERRITORY</div>
          </div>
        </div>

        <div style={{ margin:"0 16px", height:1, background:"linear-gradient(90deg, transparent, rgba(34,197,94,0.18), transparent)", zIndex:2 }} />

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"16px 12px", display:"flex", flexDirection:"column", gap:4, position:"relative", zIndex:2 }}>
          {menuItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
                  borderRadius:12, border:"none", cursor:"pointer", transition:"all 0.25s ease",
                  background: isActive ? "linear-gradient(135deg,#22c55e,#16a34a)" : "transparent",
                  boxShadow: isActive ? "0 0 24px rgba(34,197,94,0.3)" : "none",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)", fontFamily:"inherit",
                }}
              >
                <div style={{ width:36, height:36, minWidth:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.04)", transition:"all 0.25s ease" }}>
                  <item.icon style={{ width:18, height:18 }} />
                </div>
                <span style={{ fontSize:13.5, fontWeight: isActive ? 600 : 500, whiteSpace:"nowrap", flex:1, textAlign:"left" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ margin:"0 16px", height:1, background:"linear-gradient(90deg, transparent, rgba(34,197,94,0.12), transparent)", zIndex:2 }} />

        {/* User + Logout */}
        <div style={{ padding:"12px 16px 20px", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", marginBottom:8 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:14, flexShrink:0 }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{displayName}</div>
              <div style={{ fontSize:10, color:"rgba(74,222,128,0.6)", fontWeight:500 }}>Regional Partner</div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, border:"none", cursor:"pointer", background:"rgba(239,68,68,0.08)", color:"rgba(239,68,68,0.6)", fontSize:13, fontWeight:500, fontFamily:"inherit", transition:"all 0.2s" }}>
            <LogOut style={{ width:16, height:16 }} /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <header style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(0,0,0,0.06)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:30 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:"#111827", margin:0, letterSpacing:"-0.5px" }}>{pageTitles[currentPage]}</h1>
            <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0", fontWeight:500 }}>
              {municipalityName ? `${municipalityName} · Regional Partner Dashboard` : "Regional Partner Dashboard"}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", position:"relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ minHeight: "100%" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
