import {
  Package,
  Sprout,
  FileText,
  ChevronDown,
  Leaf,
  Settings,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  categories?: { name: string }[];
  onCategoriesChanged?: () => void;
}

export function Sidebar({ currentPage, onPageChange, categories = [], onCategoriesChanged }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["inventory", "agriculture"]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await supabase.from("market_categories").insert({ name: newCatName.trim() });
    setNewCatName("");
    setIsAddingCategory(false);
    if (onCategoriesChanged) onCategoriesChanged();
  };

  const handleDeleteCategory = async (e: React.MouseEvent, catName: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete category "${catName}"? This will not delete the market data but it will remove the navigation link.`)) return;
    
    const { error } = await supabase
      .from("market_categories")
      .delete()
      .eq("name", catName);
    
    if (!error && onCategoriesChanged) {
      onCategoriesChanged();
      if (currentPage === `market-${catName}`) {
        onPageChange("reports");
      }
    }
  };

  const agricultureSubItems = categories.length > 0
    ? categories.map(c => ({ id: `market-${c.name}`, label: c.name }))
    : [
      { id: "market-Herbicide", label: "Herbicide" },
      { id: "market-Insecticide", label: "Insecticide" },
      { id: "market-Molluscicide", label: "Molluscicide" },
      { id: "market-Fungicide", label: "Fungicide" },
      { id: "market-Others", label: "Others" }
    ];

  const menuItems = [
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      subItems: [
        { id: "crops", label: "Crops" },
        { id: "stock-levels", label: "Stock Levels" }
      ]
    },
    {
      id: "agriculture",
      label: "Agriculture",
      icon: Sprout,
      subItems: agricultureSubItems
    },
    { id: "reports", label: "Reports", icon: FileText }
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const isSubItemActive = (item: typeof menuItems[0]) => {
    return item.subItems?.some(sub => sub.id === currentPage);
  };

  return (
    <div className="glass-sidebar">
      {/* Inject sidebar styles */}
      <style>{`
        .glass-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, rgba(10, 10, 15, 0.97) 0%, rgba(12, 18, 14, 0.95) 50%, rgba(10, 12, 10, 0.97) 100%);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        /* Hover effects for nav items */
        .sidebar-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          background: transparent;
          font-family: inherit;
        }
        .sidebar-nav-item:not(.sidebar-nav-item-active):hover {
          background: rgba(255,255,255,0.06) !important;
          color: #ffffff !important;
        }
        .sidebar-nav-item:not(.sidebar-nav-item-active):hover .sidebar-icon-wrap {
          background: rgba(255,255,255,0.1) !important;
        }
        
        /* Sub-item buttons */
        .sidebar-sub-btn {
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          font-family: inherit;
        }
        .sidebar-sub-btn:not(.sidebar-sub-btn-active):hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.04) !important;
        }
        
        /* Orb animations */
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.1); }
          66% { transform: translate(-10px, 15px) scale(0.9); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, -25px) scale(1.15); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, 10px) scale(1.05); }
          75% { transform: translate(-15px, -10px) scale(0.95); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scrollbar */
        .glass-sidebar nav::-webkit-scrollbar {
          width: 3px;
        }
        .glass-sidebar nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .glass-sidebar nav::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 10px;
        }
      `}</style>

      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '-30px',
        width: '140px', height: '140px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(30px)',
        animation: 'floatOrb1 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '-25px',
        width: '100px', height: '100px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.07) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(25px)',
        animation: 'floatOrb2 10s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '55%', left: '40%',
        width: '70px', height: '70px',
        background: 'radial-gradient(circle, rgba(74, 222, 128, 0.05) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(18px)',
        animation: 'floatOrb3 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Logo / Brand */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          width: '42px', height: '42px', minWidth: '42px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(34, 197, 94, 0.35), 0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <Leaf className="h-5 w-5" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 style={{
            fontSize: '16px', fontWeight: 700, color: '#ffffff',
            letterSpacing: '1px', lineHeight: 1.2, margin: 0,
            fontFamily: "'Poppins', sans-serif",
          }}>GenTrade</h1>
          <p style={{
            fontSize: '10px', color: 'rgba(74, 222, 128, 0.7)',
            fontWeight: 600, letterSpacing: '2.5px',
            textTransform: 'uppercase', margin: 0,
          }}>TERRITORY</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        margin: '0 16px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.18), transparent)',
        position: 'relative', zIndex: 2,
      }} />

      {/* Navigation */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        position: 'relative', zIndex: 2,
      }}>
        {menuItems.map((item) => {
          const isMenuExpanded = expandedMenus.includes(item.id);
          const isActive = currentPage === item.id || isSubItemActive(item);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    onPageChange(item.id);
                  }
                }}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 0 24px rgba(34, 197, 94, 0.3), 0 4px 16px rgba(0,0,0,0.25)'
                    : 'none',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              >
                <div className="sidebar-icon-wrap" style={{
                  width: '36px', height: '36px', minWidth: '36px',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.25s ease',
                }}>
                  <item.icon style={{ width: '18px', height: '18px' }} />
                </div>

                <span style={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'left',
                }}>
                  {item.label}
                </span>

                {item.subItems && (
                  <ChevronDown
                    style={{
                      width: '14px', height: '14px',
                      transition: 'transform 0.3s ease',
                      transform: isMenuExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>

              {/* Sub-items */}
              <AnimatePresence>
                {item.subItems && isMenuExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      marginLeft: '26px',
                      paddingLeft: '16px',
                      borderLeft: '1px solid rgba(34, 197, 94, 0.15)',
                      marginTop: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    {item.subItems.map((subItem) => {
                      const isSubActive = currentPage === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onPageChange(subItem.id)}
                          className={`sidebar-sub-btn ${isSubActive ? 'sidebar-sub-btn-active' : ''} group`}
                          style={{
                            fontWeight: isSubActive ? 600 : 400,
                            color: isSubActive ? '#4ade80' : 'rgba(255,255,255,0.4)',
                            background: isSubActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                          }}
                        >
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: isSubActive ? '#4ade80' : 'rgba(255,255,255,0.2)',
                            boxShadow: isSubActive ? '0 0 10px rgba(74, 222, 128, 0.6)' : 'none',
                            transition: 'all 0.25s ease',
                            flexShrink: 0,
                          }} />
                          <span className="flex-1">{subItem.label}</span>
                          {item.id === "agriculture" && (
                            <button 
                              onClick={(e) => handleDeleteCategory(e, subItem.label)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-white/30 hover:text-red-400 transition-all ml-auto"
                              title="Delete category"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </button>
                      );
                    })}
                    {item.id === "agriculture" && (
                      <div className="mt-2 px-2">
                        {isAddingCategory ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              autoFocus
                              className="text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded px-2 py-1 outline-none focus:border-green-500 transition-all font-sans"
                              placeholder="New category..."
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddCategory();
                                if (e.key === "Escape") setIsAddingCategory(false);
                              }}
                            />
                            <button onClick={handleAddCategory} className="text-green-400 hover:text-green-300 p-1">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-2 text-xs text-white/40 hover:text-green-400 transition-all py-1.5 px-2 mt-1 w-full text-left font-medium rounded hover:bg-white/5 font-sans"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Category
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div style={{
        margin: '0 16px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.12), transparent)',
        position: 'relative', zIndex: 2,
      }} />

      {/* Settings */}
      <div style={{ padding: '12px', position: 'relative', zIndex: 2 }}>
        <button
          className="sidebar-nav-item"
          style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)' }}
        >
          <div className="sidebar-icon-wrap" style={{
            width: '36px', height: '36px', minWidth: '36px',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            transition: 'all 0.25s ease',
          }}>
            <Settings style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{
            fontSize: '13.5px', fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            Settings
          </span>
        </button>
      </div>

      {/* Version */}
      <div style={{
        padding: '0 12px 16px', textAlign: 'center',
        position: 'relative', zIndex: 2,
      }}>
        <p style={{
          fontSize: '9px', color: 'rgba(74, 222, 128, 0.3)',
          fontWeight: 700, letterSpacing: '2px',
          textTransform: 'uppercase', margin: 0,
        }}>
          Gen. Trade Territory v1.0
        </p>
      </div>
    </div>
  );
}
