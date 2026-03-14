import { useState, useEffect } from "react";
import { Leaf, User, Lock, Mail, ArrowRight, Loader2, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  
  const [clientType] = useState<"regional">("regional");
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Fetch Regions on mount
  useEffect(() => {
    setIsLoadingLocations(true);
    fetch("https://psgc.gitlab.io/api/regions/")
      .then(res => res.json())
      .then(data => {
        // Sort by code to keep Region I, II, III order
        setRegions(data.sort((a: any, b: any) => a.code.localeCompare(b.code)));
        setIsLoadingLocations(false);
      })
      .catch(() => setIsLoadingLocations(false));
  }, []);

  // Fetch Provinces when Region changes
  useEffect(() => {
    if (selectedRegion) {
      setIsLoadingLocations(true);
      fetch(`https://psgc.gitlab.io/api/regions/${selectedRegion}/provinces/`)
        .then(res => res.json())
        .then(data => {
          setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
          setSelectedProvince("");
          setMunicipalities([]);
          setSelectedMunicipality("");
          setIsLoadingLocations(false);
        })
        .catch(() => setIsLoadingLocations(false));
    } else {
      setProvinces([]);
      setSelectedProvince("");
      setMunicipalities([]);
      setSelectedMunicipality("");
    }
  }, [selectedRegion]);

  // Fetch Municipalities when Province changes
  useEffect(() => {
    if (selectedProvince) {
      setIsLoadingLocations(true);
      fetch(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities/`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
          setSelectedMunicipality("");
          setIsLoadingLocations(false);
        })
        .catch(() => setIsLoadingLocations(false));
    } else {
      setMunicipalities([]);
      setSelectedMunicipality("");
    }
  }, [selectedProvince]);

  const handleToggle = () => {
    setIsTransitioning(true);
    setError(null);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      onLogin();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpName,
            client_type: clientType,
            region: selectedRegion,
            province: selectedProvince,
            municipality: selectedMunicipality
          },
        },
      });

      if (authError) throw authError;

      alert("Signup successful! Please check your email for verification.");
      setIsSignUp(false);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <style>{`
        .login-page-wrapper {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0f 0%, #0c120e 40%, #0a0f0a 100%);
          overflow: hidden;
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        /* Animated background orbs */
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .login-bg-orb-1 {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%);
          animation: orbFloat1 12s ease-in-out infinite;
        }
        .login-bg-orb-2 {
          width: 350px; height: 350px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(22, 163, 74, 0.1) 0%, transparent 70%);
          animation: orbFloat2 15s ease-in-out infinite;
        }
        .login-bg-orb-3 {
          width: 250px; height: 250px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(74, 222, 128, 0.06) 0%, transparent 70%);
          animation: orbFloat3 10s ease-in-out infinite;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -30px) scale(1.15); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-40%, -60%) scale(1.1); }
        }

        /* Main container */
        .login-container {
          width: 900px;
          height: 680px; /* Increased height to accommodate the new dropdowns */
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(34, 197, 94, 0.2);
          box-shadow:
            0 0 30px rgba(34, 197, 94, 0.15),
            0 0 60px rgba(34, 197, 94, 0.05),
            0 25px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 1;
          isolation: isolate;
        }

        /* Forms Layout */
        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }
        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }
        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        /* Movement logic when right-panel-active (Sign Up mode) */
        .login-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
          opacity: 0;
        }
        .login-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }
        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }

        .login-form-side {
          height: 100%;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Overlay Layout */
        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }
        .login-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: transparent;
          color: #FFFFFF;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }
        .login-container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }
        .overlay-left {
          transform: translateX(-20%);
        }
        .login-container.right-panel-active .overlay-left {
          transform: translateX(0);
        }
        .overlay-right {
          right: 0;
          transform: translateX(0);
        }
        .login-container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        .login-form-title {
          font-family: 'Poppins', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .login-form-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 0 24px 0;
          font-weight: 400;
        }

        /* Input group */
        .login-input-group {
          position: relative;
          margin-bottom: 14px;
        }
        .login-input-group input {
          width: 100%;
          height: 44px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0 44px 0 16px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .login-input-group input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .login-input-group input:focus {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(34, 197, 94, 0.04);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
        }
        .login-input-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.2);
          pointer-events: none;
          transition: color 0.3s ease;
        }
        .login-input-group input:focus ~ .login-input-icon {
          color: rgba(34, 197, 94, 0.6);
        }

        .login-forgot {
          text-align: right;
          margin-bottom: 24px;
          margin-top: -8px;
        }
        .login-forgot a {
          font-size: 12px;
          color: rgba(74, 222, 128, 0.6);
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .login-forgot a:hover {
          color: #4ade80;
        }

        /* Submit button */
        .login-submit-btn {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
          position: relative;
          overflow: hidden;
        }
        .login-submit-btn:hover {
          box-shadow: 0 6px 30px rgba(34, 197, 94, 0.45);
          transform: translateY(-1px);
        }
        .login-submit-btn:active {
          transform: translateY(0);
        }
        .login-submit-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        .login-submit-btn:hover::after {
          left: 100%;
        }

        /* The slanted background */
        .login-overlay-bg {
          position: absolute;
          top: -30px; bottom: -30px;
          left: -100px; right: -100px;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #22c55e 100%);
          transform: skewX(-6deg);
          z-index: -1;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        .login-overlay-bg::after {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 200%; height: 100%;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0) 40%, 
            rgba(255, 255, 255, 0.15) 50%, 
            rgba(255, 255, 255, 0) 60%, 
            transparent 100%
          );
          transform: skewX(15deg);
          animation: overlayShimmer 4s ease-in-out infinite;
        }
        @keyframes overlayShimmer {
          0% { left: -150%; }
          100% { left: 150%; }
        }

        .login-container.right-panel-active .login-overlay-bg {
          transform: skewX(6deg);
        }

        /* Neon Border Animations */
        .neon-line {
          position: absolute;
          background: linear-gradient(var(--deg), transparent, #4ade80, transparent);
          z-index: 5;
          opacity: 0.6;
        }
        .neon-line-h {
          height: 1.5px;
          width: 100%;
          animation: neonMoveH 3s linear infinite;
        }
        .neon-line-v {
          width: 1.5px;
          height: 100%;
          animation: neonMoveV 3s linear infinite;
        }

        @keyframes neonMoveH {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes neonMoveV {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        /* Decorative circles on overlay */
        .overlay-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          pointer-events: none;
        }
        .overlay-circle-1 {
          width: 200px; height: 200px;
          top: -60px; right: -40px;
          opacity: 0.3;
        }
        .overlay-circle-2 {
          width: 150px; height: 150px;
          bottom: -30px; left: -20px;
          opacity: 0.2;
        }
        .overlay-circle-3 {
          width: 80px; height: 80px;
          top: 40%; right: 20%;
          opacity: 0.15;
          background: rgba(255, 255, 255, 0.03);
        }

        .login-overlay-logo {
          width: 56px; height: 56px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .login-overlay-title {
          font-family: 'Poppins', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 10px 0;
          text-align: center;
          background: linear-gradient(90deg, #fff, rgba(255,255,255,0.4), #fff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 3s linear infinite;
        }
        @keyframes textShimmer {
          to { background-position: 200% center; }
        }
        .login-overlay-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          margin: 0 0 28px 0;
          line-height: 1.6;
          max-width: 260px;
        }

        .login-toggle-btn {
          height: 44px;
          padding: 0 32px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          background: transparent;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          backdrop-filter: blur(4px);
        }
        .login-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        /* Floating particles */
        .login-particle {
          position: absolute;
          width: 3px; height: 3px;
          background: rgba(74, 222, 128, 0.4);
          border-radius: 50%;
          pointer-events: none;
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-200px) translateX(40px); opacity: 0; }
        }

        /* Responsive */
        @media (max-width: 960px) {
          .login-container {
            width: 95vw;
            height: auto;
            min-height: 500px;
            display: flex;
            flex-direction: column;
          }
          .form-container {
            position: relative;
            width: 100% !important;
            height: auto;
            transform: none !important;
          }
          .overlay-container {
            display: none;
          }
        }
      `}</style>

      {/* Background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="login-particle"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDuration: `${4 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 5}s`,
            animation: `particleFloat ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 5}s infinite`,
          }}
        />
      ))}

      {/* Main container */}
      <div className={`login-container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <div className="login-form-side">
            <form onSubmit={handleSignUp}>
              <h2 className="login-form-title">Create Account</h2>
              <p className="login-form-subtitle">Fill in your details to get started</p>

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '12px',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              <div className="login-input-group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <User className="login-input-icon" size={18} />
              </div>

              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="login-input-icon" size={18} />
              </div>

              <div className="login-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Lock className="login-input-icon" size={18} />
              </div>

              <div className="login-input-group">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  required
                  disabled={isLoading || isLoadingLocations}
                  style={{
                    width: '100%', height: '44px', background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
                    padding: '0 44px 0 16px', fontSize: '14px', color: '#ffffff', outline: 'none'
                  }}
                >
                  <option value="" disabled style={{ color: '#000' }}>Select Region (e.g. REGION I, II...)</option>
                  {regions.map(r => (
                    <option key={r.code} value={r.code} style={{ color: '#000' }}>
                      {r.regionName ? `${r.regionName.toUpperCase()} - ${r.name}` : r.name}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.2)', pointerEvents: 'none' }}>
                  <MapPin size={18} />
                </div>
              </div>
              <div className="login-input-group">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  required
                  disabled={isLoading || isLoadingLocations || !selectedRegion}
                  style={{
                    width: '100%', height: '44px', background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
                    padding: '0 44px 0 16px', fontSize: '14px', color: '#ffffff', outline: 'none'
                  }}
                >
                  <option value="" disabled style={{ color: '#000' }}>Select Province</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code} style={{ color: '#000' }}>{p.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.2)', pointerEvents: 'none' }}>
                  <MapPin size={18} />
                </div>
              </div>
              <div className="login-input-group">
                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  required
                  disabled={isLoading || isLoadingLocations || !selectedProvince}
                  style={{
                    width: '100%', height: '44px', background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
                    padding: '0 44px 0 16px', fontSize: '14px', color: '#ffffff', outline: 'none'
                  }}
                >
                  <option value="" disabled style={{ color: '#000' }}>Select Municipality</option>
                  {municipalities.map(m => (
                    <option key={m.code} value={m.code} style={{ color: '#000' }}>{m.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.2)', pointerEvents: 'none' }}>
                  <MapPin size={18} />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" style={{ marginTop: '8px' }} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Please wait...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in-container">
          <div className="login-form-side">
            <form onSubmit={handleLogin}>
              <h2 className="login-form-title">Sign In</h2>
              <p className="login-form-subtitle">Welcome back — enter your credentials</p>

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '12px',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="login-input-icon" size={18} />
              </div>

              <div className="login-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Lock className="login-input-icon" size={18} />
              </div>

              <div className="login-forgot">
                <a>Forgot password?</a>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Please wait...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* OVERLAY PANEL */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Background shimmer and effects */}
            <div className="login-overlay-bg" />

            {/* Neon Borders Overlaying the Panel */}
            <div className="neon-line neon-line-h" style={{ top: 0, '--deg': '90deg' } as any} />
            <div className="neon-line neon-line-h" style={{ bottom: 0, '--deg': '90deg' } as any} />
            <div className="neon-line neon-line-v" style={{ left: 0, '--deg': '180deg' } as any} />
            <div className="neon-line neon-line-v" style={{ right: 0, '--deg': '180deg' } as any} />

            <div className="overlay-panel overlay-left">
              <div className="overlay-circle overlay-circle-1" />
              <div className="overlay-circle overlay-circle-2" />
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                width: '280px',
                height: '280px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }}>
                <img src="/logo-transparent.png" alt="Logo" style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
              </div>
              <button type="button" className="login-toggle-btn" onClick={handleToggle}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="overlay-circle overlay-circle-1" />
              <div className="overlay-circle overlay-circle-3" />
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                width: '340px',
                height: '340px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }}>
                <img src="/logo-transparent.png" alt="Logo" style={{ width: '280px', height: '280px', objectFit: 'contain' }} />
              </div>
              <button type="button" className="login-toggle-btn" onClick={handleToggle}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
