import { User, Clock, LogOut } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface HeaderProps {
  title: string;
  user?: SupabaseUser;
}

export function Header({ title, user }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin";

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium">{dateStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-2 border border-gray-100 rounded-xl bg-gray-50/50">
            <div className="h-9 w-9 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-[10px] text-gray-400 font-medium">{user?.email || "Territory Manager"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-11 w-11 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-red-100"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
