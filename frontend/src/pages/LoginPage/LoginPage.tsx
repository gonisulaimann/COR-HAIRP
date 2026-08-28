/**
 * LoginPage.tsx   Enterprise-grade COR-HARP authentication page.
 *
 * and stat highlights, right panel with the login form. Supports 4 modes:
 * login, register, OTP verification, and forgot password. All icons from
 * lucide-react. Real-time email validation, password visibility toggle,
 * loading spinner on submit, and styled error/success alerts.
 *
 * Props:
 *   onLogin   Callback fired after successful authentication.
 */
import { forgotPassword, login, register, verifyOtp } from "@/api";
import Logo from "@/components/Logo";
import type { LoginResponse, VerifyOtpResponse } from "@/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import sideFingerpringVectorImg from "../../../assets/fingerprint.svg";
import bgImage from "../../../assets/login-signup-bg1.jpg";
type Mode = "login" | "register" | "otp" | "forgot";

interface LoginPageProps {
  onLogin: (user: {
    id: number;
    name: string;
    clearance: string;
    has_seen_onboarding: boolean;
  }) => void;
}

const isValidEmail = (e: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);

const STAT_CARDS = [
  { icon: Users, value: "1.36M+", label: "IDPs Tracked" },
  { icon: MapPin, value: "5", label: "LGAs Monitored" },
  { icon: Globe2, value: "Live", label: "HDX Data Feed" },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Real-time email validation
  const emailInvalid =
    emailTouched &&
    email.length > 0 &&
    !isValidEmail(email) &&
    mode !== "login";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res: LoginResponse = await login({ email, password });
      if (res.success) {
        onLogin({
          id: res.user_id!,
          name: res.name!,
          clearance: res.clearance!,
          has_seen_onboarding: res.has_seen_onboarding ?? false,
        });
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch {
      setError("Connection failed   is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailTouched(true);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email format   enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, email, password });
      if (res.success) {
        setSuccess("Verification code sent to your email");
        setMode("otp");
      } else setError(res.message);
    } catch {
      setError("Connection failed   is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res: VerifyOtpResponse = await verifyOtp({ email, otp_code: otp });
      if (res.success) {
        onLogin({
          id: res.user_id!,
          name: res.name!,
          clearance: res.clearance!,
          has_seen_onboarding: false,
        });
      } else setError(res.message);
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
      setTimeout(() => setMode("login"), 3000);
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg">
      <img src={bgImage} className="w-full h-screen absolute z-0 opacity-25" />

      {/* ── Left Panel: Brand + Lottie + Stats ── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-un-navy via-[#0A1628] to-dark-bg">
        {/* <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-black"> */}
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-un-blue/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-un-blue/15 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Brand */}
          <div className="animate-fade-in ">
            <Logo className="w-40" />
          </div>

          {/* Center: Lottie + Tagline */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <img
              src={sideFingerpringVectorImg}
              className="animate-fade-in w-56"
            />
            <h1 className="animate__animated animate__bounceIn mt-6 text-3xl font-extrabold text-white text-center leading-tight ">
              Humanitarian AI
              <br />
              Resource Predictor
            </h1>
            <p
              className="mt-3 text-sm text-surface-400 text-center max-w-md animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              Real-time LSTM forecasting, MILP optimization, and geospatial
              intelligence for Borno State humanitarian operations.
            </p>
          </div>

          {/* Bottom: Stat Cards */}
          <div
            className="flex gap-4 animate__animated animate__fadeIn  justify-center"
            style={{ animationDelay: "200ms" }}
          >
            {STAT_CARDS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-card p-2 animate-fade-in-up"
                  style={{ animationDelay: `${250 + i * 80}ms` }}
                >
                  <div className="w-6 h-6 rounded-btn bg-un-blue/15 flex items-center justify-center">
                    <Icon size={16} className="text-un-blue" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="text-[0.65rem] font-medium uppercase tracking-wider text-surface-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full  p-6 rounded-xl max-w-md animate__animated animate__bounceInRight ">
          {/* Mobile-only brand */}
          <div className="text-center mb-8 lg:hidden">
            {<Logo className="w-64" />}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-dark-text">
              {mode === "login" && "Secure Access Portal"}
              {mode === "register" && "Create Account"}
              {mode === "otp" && "Email Verification"}
              {mode === "forgot" && "Password Recovery"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {mode === "login" && "Sign in to access operational data"}
              {mode === "register" && "Register for COR-HARP access"}
              {mode === "otp" && "Enter the verification code"}
              {mode === "forgot" && "We'll send recovery instructions"}
            </p>
          </div>

          {/* Alert */}
          {error && (
            <div className="flex items-center gap-2.5 bg-un-red/10 border border-un-red/25 rounded-card px-4 py-3 mb-5 animate-fade-in">
              <AlertCircle size={18} className="text-[#FCA5A5] flex-shrink-0" />
              <p className="text-[0.82rem] text-[#FCA5A5]">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 bg-un-green/10 border border-un-green/25 rounded-card px-4 py-3 mb-5 animate-fade-in">
              <CheckCircle2
                size={18}
                className="text-green-400 flex-shrink-0"
              />
              <p className="text-[0.82rem] text-green-400">{success}</p>
            </div>
          )}

          {/* ── Login Form ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 ">
              <InputField
                icon={Mail}
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="you@agency.org"
              />
              <InputField
                icon={Lock}
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                suffix={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onSuffixClick={() => setShowPassword(!showPassword)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-card font-semibold text-sm text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <div className="flex items-center justify-between text-[0.78rem]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="text-gray-300 hover:text-un-blue transition-colors"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-un-blue font-semibold hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          )}

          {/* ── Register Form ── */}
          {mode === "register" && (
            <form
              onSubmit={handleRegister}
              className="space-y-5 overflow-y-auto "
            >
              <InputField
                icon={User}
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Your name"
              />
              <InputField
                icon={Mail}
                label="Email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setEmailTouched(true);
                }}
                placeholder="you@agency.org"
                invalid={emailInvalid}
                hint={emailInvalid ? "Enter a valid email address" : undefined}
              />
              <InputField
                icon={Lock}
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Min 6 characters"
                type={showPassword ? "text" : "password"}
                suffix={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onSuffixClick={() => setShowPassword(!showPassword)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-card font-semibold text-sm text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Register & Verify</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="text-center text-[0.78rem] text-surface-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-un-blue font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {/* ── OTP Form ── */}
          {mode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-[0.82rem] text-surface-400 text-center">
                Code sent to <strong className="text-un-blue">{email}</strong>
              </p>
              <div className="flex justify-center">
                <KeyRound size={20} className="text-surface-500 mr-2 mt-3" />
                <input
                  className="w-48 bg-dark-bg border border-white/[0.06] rounded-card px-4 py-3 text-center text-2xl font-bold tracking-[8px] text-dark-text focus:outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-card font-semibold text-sm text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>
              <p className="text-center text-[0.78rem] text-surface-500">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-un-blue hover:underline"
                >
                  Back to registration
                </button>
              </p>
            </form>
          )}

          {/* ── Forgot Password Form ── */}
          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5">
              <InputField
                icon={Mail}
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="you@agency.org"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-card font-semibold text-sm text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <Mail size={16} />
                  </>
                )}
              </button>
              <p className="text-center text-[0.78rem] text-surface-500">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-un-blue hover:underline"
                >
                  Back to login
                </button>
              </p>
            </form>
          )}

          {/* Footer */}
          <div className="mt-10 pt-5 border-t border-white/[0.04] text-center">
            <p className="text-[0.6rem] text-surface-500/60 leading-relaxed">
              COR-HARP v2.3 · Open-Source Humanitarian AI
              <br />
              Built for aid workers in Northeast Nigeria.
              <br />
              <span className="text-un-blue/70">941K-parameter LSTM + MILP optimization engine</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Input Field with Icon ──────────────────────────────────── */

interface InputFieldProps {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
  hint?: string;
  suffix?: React.ReactNode;
  onSuffixClick?: () => void;
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  invalid,
  hint,
  suffix,
  onSuffixClick,
}: InputFieldProps) {
  return (
    <div>
      <label className="text-[0.75rem] font-semibold text-gray-400 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Icon size={18} />
        </div>
        <input
          className={`w-full bg-dark-bg border rounded-card pl-10 pr-${suffix ? "10" : "4"} py-2.5 text-[0.85rem] text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
            invalid
              ? "border-un-red/50 focus:border-un-red focus:ring-un-red/20"
              : "border-white/[0.06] focus:border-un-blue focus:ring-un-blue/20"
          }`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {suffix && (
          <button
            type="button"
            onClick={onSuffixClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
          >
            {suffix}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[0.7rem] text-un-red/80">{hint}</p>}
    </div>
  );
}
