"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "phone" | "otp";

const RESEND_COOLDOWN = 60;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (step === "phone" && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function formatPhoneDisplay(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  function getFullPhone(): string {
    const digits = phone.replace(/\D/g, "");
    return `+254${digits}`;
  }

  function isValidPhone(): boolean {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 9 && /^[17]/.test(digits);
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    setError("");
  }

  async function handleSendOtp() {
    if (!isValidPhone()) {
      setError("Enter a valid Kenyan phone number (e.g. 7XX XXX XXX)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: getFullPhone(),
      });
      if (otpError) {
        setError(otpError.message || "Failed to send verification code.");
        setLoading(false);
        return;
      }
      setStep("otp");
      setResendTimer(RESEND_COOLDOWN);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (digits.length > 1) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = digits[i] || "";
        }
        setOtp(newOtp);
        setError("");
        const focusIndex = Math.min(digits.length, 5);
        otpRefs.current[focusIndex]?.focus();
        if (digits.length === 6) {
          verifyOtpCode(newOtp.join(""));
        }
        return;
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (digit && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        verifyOtpCode(fullOtp);
      }
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const fullOtp = otp.join("");
      if (fullOtp.length === 6) {
        verifyOtpCode(fullOtp);
      }
    }
  }

  const verifyOtpCode = useCallback(
    async (token: string) => {
      setLoading(true);
      setError("");
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: getFullPhone(),
          token,
          type: "sms",
        });
        if (verifyError) {
          setError(
            verifyError.message || "Invalid verification code. Please try again."
          );
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
          setLoading(false);
          return;
        }
        router.push("/dashboard");
      } catch {
        setError("Network error. Please check your connection and try again.");
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phone, router]
  );

  async function handleResendOtp() {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: getFullPhone(),
      });
      if (otpError) {
        setError(otpError.message || "Failed to resend code.");
        setLoading(false);
        return;
      }
      setResendTimer(RESEND_COOLDOWN);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F2A44] p-12 text-white">
        <div>
          <div className="flex h-1.5 w-24 mb-8 rounded-full overflow-hidden">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-[#E53E3E]" />
            <div className="flex-1 bg-[#1D6B3F]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">KURA360</h1>
          <p className="mt-2 text-lg text-blue-200/80">
            Campaign Compliance &amp; Operations
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D6B3F]/30">
              <svg className="h-4 w-4 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Real-time Compliance</h3>
              <p className="text-sm text-blue-200/60">
                Track campaign finances against ECFA limits in real time
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2E75B6]/30">
              <svg className="h-4 w-4 text-[#4A9FE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Mobile-First Design</h3>
              <p className="text-sm text-blue-200/60">
                Built for field agents and campaign managers on the go
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ED8936]/30">
              <svg className="h-4 w-4 text-[#ED8936]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">M-Pesa Native</h3>
              <p className="text-sm text-blue-200/60">
                Seamless integration with Kenya&#39;s leading mobile money platform
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-200/40">
          &copy; {new Date().getFullYear()} Sysmera Limited. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Mobile header with navy bg */}
        <div className="bg-[#0F2A44] px-6 pb-8 pt-12 lg:hidden">
          <div className="flex h-1 w-16 mb-4 rounded-full overflow-hidden">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-[#E53E3E]" />
            <div className="flex-1 bg-[#1D6B3F]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            KURA360
          </h1>
          <p className="mt-1 text-sm text-blue-200/70">
            Campaign Compliance &amp; Operations
          </p>
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            {step === "phone" ? (
              <div>
                <h2 className="text-2xl font-bold text-[#1A202C]">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-[#4A5568]">
                  Enter your Kenyan phone number to receive a verification code
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-[#1A202C]"
                    >
                      Phone number
                    </label>
                    <div className="relative mt-2 flex">
                      <span className="inline-flex items-center rounded-l-[8px] border border-r-0 border-[#E2E8F0] bg-[#F7F9FC] px-3 text-sm font-medium text-[#4A5568]">
                        +254
                      </span>
                      <input
                        ref={phoneInputRef}
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="7XX XXX XXX"
                        value={formatPhoneDisplay(phone)}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendOtp();
                        }}
                        className="block w-full rounded-r-[8px] border border-[#E2E8F0] bg-white px-3 py-3 text-lg tracking-wide text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#2E75B6] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/20"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-[8px] bg-[#FFF5F5] px-4 py-3 text-sm text-[#E53E3E]">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !isValidPhone()}
                    className="flex w-full items-center justify-center rounded-[8px] bg-[#1D6B3F] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#165C34] focus:outline-none focus:ring-2 focus:ring-[#1D6B3F]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending code...
                      </>
                    ) : (
                      "Send verification code"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="mb-6 flex items-center gap-1 text-sm font-medium text-[#4A5568] transition-colors hover:text-[#1A202C]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <h2 className="text-2xl font-bold text-[#1A202C]">
                  Enter verification code
                </h2>
                <p className="mt-2 text-sm text-[#4A5568]">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-[#1A202C]">
                    +254 {formatPhoneDisplay(phone)}
                  </span>
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData
                            .getData("text")
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          if (pasted.length > 0) {
                            handleOtpChange(0, pasted);
                          }
                        }}
                        disabled={loading}
                        className="h-14 w-12 rounded-[8px] border-2 border-[#E2E8F0] bg-white text-center text-xl font-bold text-[#1A202C] transition-colors focus:border-[#2E75B6] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/20 disabled:opacity-50 sm:h-16 sm:w-14"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-[8px] bg-[#FFF5F5] px-4 py-3 text-sm text-[#E53E3E]">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => verifyOtpCode(otp.join(""))}
                    disabled={loading || otp.join("").length !== 6}
                    className="flex w-full items-center justify-center rounded-[8px] bg-[#1D6B3F] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#165C34] focus:outline-none focus:ring-2 focus:ring-[#1D6B3F]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      "Verify & Sign in"
                    )}
                  </button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-[#A0AEC0]">
                        Resend code in{" "}
                        <span className="font-medium text-[#4A5568]">
                          {resendTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-sm font-medium text-[#2E75B6] transition-colors hover:text-[#1B3A5C] disabled:opacity-50"
                      >
                        {"Didn\u0027t receive a code? Resend"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-[#A0AEC0]">
            Powered by{" "}
            <span className="font-medium text-[#4A5568]">
              Sysmera Limited
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}


function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#1D6B3F]" />
        <p className="mt-4 text-sm text-[#4A5568]">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
