import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { CropsPage } from "./components/CropsPage";
import { StockLevelsPage } from "./components/StockLevelsPage";
import { MarketPotentialPage } from "./components/MarketPotentialPage";
import { ReportsPage } from "./components/ReportsPage";
import { LoginPage } from "./components/LoginPage";
import { RegionalDashboard } from "./components/RegionalDashboard";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const pageConfig: Record<string, { title: string; component: React.ReactNode }> = {
  crops: { title: "Crops", component: <CropsPage /> },
  "stock-levels": { title: "Stock Levels", component: <StockLevelsPage /> },
  "market-herbicide": { title: "Herbicide Potential", component: <MarketPotentialPage category="Herbicide" /> },
  "market-insecticide": { title: "Insecticide Potential", component: <MarketPotentialPage category="Insecticide" /> },
  "market-molluscicide": { title: "Molluscicide Potential", component: <MarketPotentialPage category="Molluscicide" /> },
  "market-fungicide": { title: "Fungicide Potential", component: <MarketPotentialPage category="Fungicide" /> },
  "market-others": { title: "Others Potential", component: <MarketPotentialPage category="Others" /> },
  reports: { title: "Reports", component: <ReportsPage /> }
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState("market-Herbicide");
  const [categories, setCategories] = useState<{ name: string }[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCategories = () => {
    supabase.from('market_categories').select('name').order('created_at').then(({ data }) => {
      if (data) setCategories(data);
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  let title = "Dashboard";
  let component: React.ReactNode = <div />;

  if (currentPage.startsWith("market-")) {
    const catName = currentPage.replace("market-", "");
    title = `${catName} Potential`;
    component = <MarketPotentialPage category={catName} initialCategories={categories.map(c => c.name)} />;
  } else if (pageConfig[currentPage]) {
    title = pageConfig[currentPage].title;
    if (currentPage === "reports") {
      component = <ReportsPage categories={categories.map(c => ({ name: c.name, color: "" }))} />;
    } else {
      component = pageConfig[currentPage].component;
    }
  } else {
    title = pageConfig["market-Herbicide"]?.title || "Herbicide Potential";
    component = <MarketPotentialPage category="Herbicide" initialCategories={categories.map(c => c.name)} />;
  }

  if (!session) {
    return <LoginPage onLogin={() => { }} />;
  }

  const userMeta = session.user.user_metadata || {};
  if (userMeta.client_type === "regional") {
    return (
      <RegionalDashboard
        regionCode={userMeta.region}
        municipalityCode={userMeta.municipality}
        user={session.user}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9]">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} categories={categories} onCategoriesChanged={fetchCategories} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} user={session.user} />
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              {component}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
