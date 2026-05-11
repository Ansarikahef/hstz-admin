import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Compass, ArrowRight } from "lucide-react";
import HzInput from "@/components/shared/HzInput";
import { useAuth, DEMO_CREDENTIALS } from "@/hooks/useAuth";
import { LOGIN_HERO } from "@/lib/mockData";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    const value = form.email.trim(); 
  
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isMobile = /^[0-9]{10}$/.test(value);
  
    // Login field validation (email OR mobile)
    if (!value) {
      e.email = "Email or mobile number is required.";
    } else if (!isEmail && !isMobile) {
      e.email = "Enter a valid email or 10-digit mobile number.";
    }
  
    // Password validation
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
  
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try{
      const {status,message,token} = await login({ email: form.email, password: form.password });
      console.log("Login response:", {status, message, token});
      if(status === 1){
        toast.success(message || "Login successful. Welcome back!");
        navigate("/dashboard");
      }
      else{
        setErrors({ password: message || "Login failed. Please check your credentials and try again." });
        toast.error("Sign-in failed", { description: message || "Login failed. Please check your credentials and try again." });
      }
    }
    catch(e){
      setErrors({ password: "Network error. Please try again." });
      toast.error("Sign-in failed", { description: "Network error. Please try again." });
    }
    finally{
      setSubmitting(false);
    }
    
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr]" data-testid="login-page">
      {/* Hero */}
      <div className="relative hidden lg:block overflow-hidden">
        <img src={LOGIN_HERO} alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(22,45,36,0.55) 0%, rgba(22,45,36,0.35) 60%, rgba(217,115,78,0.25) 100%)" }} />
        <div className="relative z-10 h-full p-12 flex flex-col text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--hz-cta)" }}>
              <Compass className="size-5" strokeWidth={1.75} />
            </div>
            <div className="hz-heading text-xl font-semibold tracking-tight">HZ Travel Zone</div>
          </div>
          <div className="mt-auto max-w-md">
            <div className="text-[11px] tracking-[0.22em] uppercase text-white/70 mb-3">Operator Console</div>
            <h2 className="hz-heading text-4xl xl:text-5xl font-medium leading-[1.05] tracking-tight">
              Where every itinerary becomes a quiet promise.
            </h2>
            <p className="mt-5 text-white/75 leading-relaxed text-[15px] max-w-md">
              Manage packages, ledger every transaction, and care for your travellers with the calm confidence of a trusted concierge.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm">
              {[
                { v: "1.2K+", l: "Bookings" },
                { v: "₹4.6Cr", l: "Tracked" },
                { v: "32", l: "Destinations" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="hz-heading text-2xl font-semibold">{s.v}</div>
                  <div className="text-[11px] tracking-[0.18em] uppercase text-white/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-12 bg-[var(--hz-bg)] hz-grain">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--hz-cta)" }}>
              <Compass className="size-5 text-white" strokeWidth={1.75} />
            </div>
            <div className="hz-heading text-lg font-semibold">HZ Travel Zone</div>
          </div>
          <div className="hz-label mb-3">Sign in</div>
          <h1 className="hz-heading text-3xl sm:text-4xl font-medium tracking-tight text-[var(--hz-text)] leading-[1.05]">
            Step back into your console.
          </h1>
          <p className="mt-3 text-[var(--hz-text-2)] text-[15px]">
            Demo credentials are pre-filled. Press sign in to enter the dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate data-testid="login-form">
            <HzInput
              label="Email address"
              icon={Mail}
              type="email"
              placeholder="you@hztravelzone.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              testid="login-email"
              autoComplete="email"
            />
            <div>
              <HzInput
                label="Password"
                icon={Lock}
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                testid="login-password"
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    data-testid="login-show-password"
                    onClick={() => setShowPwd((s) => !s)}
                    className="text-[var(--hz-text-2)] hover:text-[var(--hz-text)] pointer-events-auto"
                  >
                    {showPwd ? <EyeOff className="size-4" strokeWidth={1.5} /> : <Eye className="size-4" strokeWidth={1.5} />}
                  </button>
                }
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 select-none cursor-pointer text-[var(--hz-text-2)]">
                <input
                  type="checkbox"
                  data-testid="login-remember"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="size-4 rounded border-[var(--hz-border)] accent-[var(--hz-cta)]"
                />
                Remember me
              </label>
              <a className="text-[var(--hz-cta)] hover:underline font-medium" href="#" data-testid="login-forgot">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="login-submit"
              className="hz-btn-primary w-full disabled:opacity-70"
            >
              {submitting ? "Signing in…" : "Sign in"}
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </button>
          </form>

          <div className="mt-8 text-sm text-[var(--hz-text-2)]">
            New traveller partner? <Link to="/register" className="text-[var(--hz-cta)] font-medium hover:underline" data-testid="login-to-register">Create an account</Link>
          </div>
          <div className="mt-10 text-[11px] tracking-[0.18em] uppercase text-[var(--hz-text-2)]/70">
            © {new Date().getFullYear()} HZ Travel Zone · Secure session
          </div>
        </div>
      </div>
    </div>
  );
}
