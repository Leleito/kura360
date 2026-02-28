import Link from "next/link";
import {
  Wallet,
  Users,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Financial Tracking",
    description: "ECFA-compliant expense tracking across 6 spending categories",
    color: "#2E75B6",
  },
  {
    icon: Users,
    title: "Agent Management",
    description: "Deploy and monitor field agents across all 47 counties",
    color: "#805AD5",
  },
  {
    icon: Shield,
    title: "Evidence Vault",
    description: "SHA-256 verified evidence with full chain of custody",
    color: "#1D6B3F",
  },
  {
    icon: Heart,
    title: "Donation Compliance",
    description: "M-Pesa native with automatic ECFA threshold monitoring",
    color: "#ED8936",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F2A44]">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-3xl">
          {/* Logo */}
          <div className="flex items-baseline justify-center gap-1.5 mb-6">
            <span className="text-white text-6xl font-black tracking-tight">
              KURA
            </span>
            <span className="text-[#27AE60] text-6xl font-black tracking-tight">
              360
            </span>
          </div>

          <p className="text-white/70 text-xl font-light mb-2 tracking-wide">
            Campaign Compliance & Operations
          </p>
          <p className="text-white/40 text-sm mb-12 max-w-lg mx-auto leading-relaxed">
            The all-in-one platform for Kenyan election campaigns. Track finances,
            manage agents, secure evidence, and stay compliant with the Election
            Campaign Financing Act.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1D6B3F] text-white font-semibold rounded-xl hover:bg-[#27AE60] transition-all duration-200 shadow-lg shadow-[#1D6B3F]/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              View Dashboard
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-left hover:bg-white/8 transition-colors group"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon
                    className="h-5 w-5"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white/30 text-xs">
            <span>Sysmera Limited</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>v0.1.0</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <CheckCircle className="h-3 w-3 text-[#27AE60]" />
            ECFA Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
