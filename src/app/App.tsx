import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { CropsPage } from "./components/CropsPage";
import { StockLevelsPage } from "./components/StockLevelsPage";
import { MarketPotentialPage } from "./components/MarketPotentialPage";
import { ReportsPage } from "./components/ReportsPage";
import { LoginPage } from "./components/LoginPage";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const pageConfig: Record<string, { title: string; component: React.ReactNode }> = {
  crops: { title: "Crops", component: <CropsPage /> },
  "stock-levels": { title: "Stock Levels", component: <StockLevelsPage /> },
  "market-potential": { title: "Market Potential", component: <MarketPotentialPage /> },
  reports: { title: "Reports", component: <ReportsPage /> }
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState("market-potential");

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

  const { title, component } = pageConfig[currentPage] || pageConfig["market-potential"];

  if (!session) {
    return <LoginPage onLogin={() => { }} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F1F8E9] to-[#E8F5E9]">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} user={session.user} />
        <main className="flex-1 overflow-y-auto">
          {component}
        </main>
      </div>
    </div>
  );
}
