"use client";

import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Building2,
  MapPin,
  Users,
  Wallet,
  Shield,
  Heart,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Landmark,
  Crown,
  Scale,
  UserCheck,
  Vote,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/premium";

/* ── Election Seat Data ── */
const electionSeats = [
  {
    key: "president",
    title: "President",
    icon: Crown,
    color: "bg-purple-100 text-[#805AD5] border-purple-200",
    iconBg: "bg-purple-500",
    jurisdiction: "National",
    area: "Republic of Kenya",
    electedBy: "All registered voters nationwide",
    spendingLimit: "KES 5,229,000,000",
    ecfaRef: "ECFA Section 18(1)(a)",
    term: "5 years (max 2 terms)",
    requirements: [
      "Kenyan citizen by birth",
      "At least 35 years of age",
      "Registered voter",
      "Nominated by a political party or independent",
      "Holds a degree from a recognized university",
      "Satisfies moral and ethical requirements of Chapter 6",
    ],
    keyRegulations: [
      "Must open a dedicated campaign bank account",
      "All donations above KES 50,000 must be declared",
      "Anonymous donations exceeding KES 5,000 are prohibited",
      "Must submit expenditure returns to IEBC within 90 days after election",
      "Foreign donations are prohibited",
    ],
    campaignAreas: [
      "47 Counties",
      "290 Constituencies",
      "All polling stations nationwide",
    ],
    description:
      "The President is the Head of State and Government, elected through a national popular vote. A candidate must receive more than 50% of votes cast and at least 25% in more than half of the 47 counties.",
  },
  {
    key: "governor",
    title: "Governor",
    icon: Landmark,
    color: "bg-blue-100 text-[#2E75B6] border-blue-200",
    iconBg: "bg-[#2E75B6]",
    jurisdiction: "County",
    area: "One of Kenya's 47 Counties",
    electedBy: "Registered voters within the county",
    spendingLimit: "KES 453,000,000",
    ecfaRef: "ECFA Section 18(1)(b)",
    term: "5 years (max 2 terms)",
    requirements: [
      "Kenyan citizen",
      "At least 35 years of age",
      "Registered voter in the county",
      "Nominated by a political party or independent",
      "Holds a degree from a recognized university",
      "Must run with a Deputy Governor",
    ],
    keyRegulations: [
      "County campaign bank account required",
      "Must track all spending across sub-counties",
      "Agent deployment to cover all county wards",
      "County-specific donation limits apply",
      "Must report to County Elections Board",
    ],
    campaignAreas: [
      "Sub-counties within the county",
      "All wards in the county",
      "County-level polling stations",
    ],
    description:
      "The Governor is the chief executive of the county government, responsible for county-level governance, service delivery, and development. Elected with a Deputy Governor as a team.",
  },
  {
    key: "senator",
    title: "Senator",
    icon: Scale,
    color: "bg-green-100 text-[#1D6B3F] border-green-200",
    iconBg: "bg-[#1D6B3F]",
    jurisdiction: "County",
    area: "One of Kenya's 47 Counties",
    electedBy: "Registered voters within the county",
    spendingLimit: "KES 243,000,000",
    ecfaRef: "ECFA Section 18(1)(c)",
    term: "5 years",
    requirements: [
      "Kenyan citizen",
      "At least 30 years of age",
      "Registered voter in the county",
      "Nominated by a political party or independent",
      "Holds a degree from a recognized university",
    ],
    keyRegulations: [
      "County-wide campaign finance tracking",
      "Must maintain transparent expenditure records",
      "Donations above threshold must be declared",
      "Campaign period restrictions apply",
      "Returns to be filed with IEBC post-election",
    ],
    campaignAreas: [
      "All constituencies within the county",
      "Sub-county level engagement",
      "County-wide media campaigns",
    ],
    description:
      "Senators represent counties in the Senate (upper house of Parliament). They protect county interests, participate in legislation, and oversee revenue allocation to county governments.",
  },
  {
    key: "women_rep",
    title: "Women Representative",
    icon: UserCheck,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    iconBg: "bg-pink-500",
    jurisdiction: "County",
    area: "One of Kenya's 47 Counties",
    electedBy: "All registered voters within the county",
    spendingLimit: "KES 243,000,000",
    ecfaRef: "ECFA Section 18(1)(d)",
    term: "5 years",
    requirements: [
      "Female Kenyan citizen",
      "At least 18 years of age",
      "Registered voter in the county",
      "Nominated by a political party or independent",
      "Holds a post-secondary qualification",
    ],
    keyRegulations: [
      "Same campaign finance regulations as Senators",
      "County-wide campaign coverage required",
      "Must comply with gender representation laws",
      "Full expenditure reporting to IEBC",
      "Subject to spending limit enforcement",
    ],
    campaignAreas: [
      "All constituencies within the county",
      "Targeted women-focused outreach",
      "County-wide media and grassroots campaigns",
    ],
    description:
      "Women Representatives ensure women's voices in the National Assembly. Each county elects one Women Representative, creating an additional 47 seats in Parliament dedicated to women's representation.",
  },
  {
    key: "mp",
    title: "Member of Parliament (MP)",
    icon: Vote,
    color: "bg-orange-100 text-[#ED8936] border-orange-200",
    iconBg: "bg-[#ED8936]",
    jurisdiction: "Constituency",
    area: "One of Kenya's 290 Constituencies",
    electedBy: "Registered voters within the constituency",
    spendingLimit: "KES 35,000,000",
    ecfaRef: "ECFA Section 18(1)(e)",
    term: "5 years",
    requirements: [
      "Kenyan citizen",
      "At least 18 years of age",
      "Registered voter in the constituency",
      "Nominated by a political party or independent",
      "Holds a post-secondary qualification",
    ],
    keyRegulations: [
      "Constituency-level spending limits",
      "Must track ward-level expenditures",
      "Agent deployment across constituency wards",
      "Donation transparency requirements",
      "Post-election returns within 90 days",
    ],
    campaignAreas: [
      "All wards within the constituency",
      "Ward-level polling stations",
      "Constituency-wide media outreach",
    ],
    description:
      "Members of Parliament represent constituencies in the National Assembly (lower house of Parliament). They legislate, represent constituents, and oversee government actions. Kenya has 290 elected MPs.",
  },
  {
    key: "mca",
    title: "Member of County Assembly (MCA)",
    icon: Briefcase,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    iconBg: "bg-teal-500",
    jurisdiction: "Ward",
    area: "One of Kenya's 1,450 Wards",
    electedBy: "Registered voters within the ward",
    spendingLimit: "KES 7,000,000",
    ecfaRef: "ECFA Section 18(1)(f)",
    term: "5 years",
    requirements: [
      "Kenyan citizen",
      "At least 18 years of age",
      "Registered voter in the ward",
      "Nominated by a political party or independent",
      "Holds a secondary school certificate",
    ],
    keyRegulations: [
      "Ward-level spending caps",
      "Grassroots campaign finance reporting",
      "Local agent deployment and tracking",
      "Community-level donation records",
      "Returns filed through county election office",
    ],
    campaignAreas: [
      "All polling stations within the ward",
      "Local community meetings and events",
      "Ward-level door-to-door campaigns",
    ],
    description:
      "MCAs represent wards in the County Assembly. They are the grassroots-level elected leaders responsible for county legislation, oversight of county executive, and representing ward interests.",
  },
];

/* ── Platform Guide Sections ── */
const platformGuides = [
  {
    key: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    items: [
      {
        q: "How do I create a campaign?",
        a: "Navigate to Settings and fill in your campaign profile including candidate name, party affiliation, election position, and geographic area (county/constituency/ward). Set your ECFA spending limit based on your election seat level.",
      },
      {
        q: "How do I sign in?",
        a: "KURA360 supports two authentication methods: Phone OTP (enter your Kenyan phone number starting with 07 or 01 to receive a one-time password via SMS) and Google Sign-In (click the Google button to authenticate with your Google account).",
      },
      {
        q: "How do I invite team members?",
        a: "Go to Settings > Team Members and click 'Invite Member'. Enter their email or phone number and assign a role: Finance Officer (manage transactions), Agent Coordinator (manage field agents), Field Agent (upload evidence), or Viewer (read-only access).",
      },
    ],
  },
  {
    key: "finance",
    title: "Financial Tracking",
    icon: Wallet,
    items: [
      {
        q: "How do I record a transaction?",
        a: "Navigate to Finance > Transactions and click 'New Transaction'. Select the type (income or expense), choose an ECFA expenditure category (Venue Hire, Publicity Materials, Advertising, Transport, Personnel, Administration, or Other), enter the amount in KES, and attach supporting evidence.",
      },
      {
        q: "What are the ECFA spending categories?",
        a: "The Election Campaign Financing Act requires all campaign expenses to be categorized as: Venue Hire, Publicity Materials, Advertising/Media, Transport/Travel, Personnel Costs, Administration/Office, or Other. KURA360 automatically tracks spending against these categories.",
      },
      {
        q: "How do spending limits work?",
        a: "Each election seat has a legally mandated spending limit set by the IEBC. KURA360 monitors your total spending against this limit and triggers alerts at 50%, 80%, and 95% thresholds to ensure compliance.",
      },
    ],
  },
  {
    key: "agents",
    title: "Agent Management",
    icon: Users,
    items: [
      {
        q: "How do I deploy field agents?",
        a: "Navigate to Agents, add agent profiles with their details, and assign them to polling stations. Agents can check in via the mobile app, updating their status to 'Deployed', 'En Route', or 'Pending'.",
      },
      {
        q: "How do I track agent coverage?",
        a: "The Agent Management dashboard shows real-time deployment status across all your polling stations. Gaps are highlighted in red so you can quickly identify stations without agent coverage.",
      },
    ],
  },
  {
    key: "evidence",
    title: "Evidence Vault",
    icon: Shield,
    items: [
      {
        q: "What is the Evidence Vault?",
        a: "The Evidence Vault is a secure, tamper-resistant storage for campaign documentation. Upload photos, videos, and documents as evidence of campaign activities, expenditures, and incidents. Each item is timestamped and hashed for integrity verification.",
      },
      {
        q: "What file formats are supported?",
        a: "Photos (JPEG, PNG up to 50MB), Videos (MP4 up to 50MB), and Documents (PDF, DOCX up to 50MB). All uploads are securely stored in Supabase Storage with automatic backup.",
      },
    ],
  },
  {
    key: "donations",
    title: "Donation Compliance",
    icon: Heart,
    items: [
      {
        q: "How do I track donations?",
        a: "Navigate to Donations to view all received contributions. Each donation requires KYC verification including donor name, ID number, and amount. Donations above KES 50,000 are automatically flagged for enhanced scrutiny.",
      },
      {
        q: "What donations are prohibited?",
        a: "Under the ECFA, the following are prohibited: Anonymous donations exceeding KES 5,000, foreign donations (from non-Kenyan citizens or foreign entities), donations from government bodies, and cash donations above the prescribed limit.",
      },
    ],
  },
  {
    key: "compliance",
    title: "Compliance & Reporting",
    icon: FileText,
    items: [
      {
        q: "What compliance reports does KURA360 generate?",
        a: "KURA360 generates: Expenditure Reports (by ECFA category), Donation Reports (with KYC status), Agent Deployment Reports, Evidence Audit Trails, and Campaign Finance Returns for IEBC submission.",
      },
      {
        q: "When must I file returns?",
        a: "Under the ECFA, campaign finance returns must be submitted to the IEBC within 90 days after the election. KURA360 sends reminders as the deadline approaches and helps you compile all required documentation.",
      },
    ],
  },
];

export default function HelpPage() {
  const [expandedSeat, setExpandedSeat] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"seats" | "platform">("seats");

  const filteredSeats = electionSeats.filter(
    (seat) =>
      seat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuides = platformGuides
    .map((guide) => ({
      ...guide,
      items: guide.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((guide) => guide.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="none">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2A44] flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-gray-400" />
            Help Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Election seat guides, ECFA compliance rules, and platform documentation
          </p>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn direction="up" delay={0.05}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics, election seats, regulations..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent"
          />
        </div>
      </FadeIn>

      {/* Section Tabs */}
      <FadeIn direction="up" delay={0.1}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection("seats")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeSection === "seats"
                ? "bg-[#0F2A44] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <Building2 className="h-4 w-4" />
            Election Seats
          </button>
          <button
            onClick={() => setActiveSection("platform")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeSection === "platform"
                ? "bg-[#0F2A44] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Platform Guide
          </button>
        </div>
      </FadeIn>

      {/* Election Seats Section */}
      {activeSection === "seats" && (
        <div className="space-y-4">
          {/* Overview Banner */}
          <FadeIn direction="up" delay={0.15}>
            <div className="bg-gradient-to-r from-[#0F2A44] to-[#1B3A5C] rounded-xl p-6 text-white">
              <h2 className="text-lg font-bold mb-2">Kenya Election Positions</h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Kenya has 6 elected positions across three levels of government: National (President),
                County (Governor, Senator, Women Representative), Constituency (MP), and Ward (MCA).
                Each position has specific ECFA spending limits and compliance requirements that
                KURA360 helps you track.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                {electionSeats.map((seat) => (
                  <button
                    key={seat.key}
                    onClick={() => {
                      setExpandedSeat(expandedSeat === seat.key ? null : seat.key);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors",
                      expandedSeat === seat.key ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", seat.iconBg)}>
                      <seat.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{seat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Seat Cards */}
          {filteredSeats.map((seat, index) => (
            <FadeIn key={seat.key} direction="up" delay={0.1 + index * 0.03}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Seat Header */}
                <button
                  onClick={() => setExpandedSeat(expandedSeat === seat.key ? null : seat.key)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", seat.iconBg)}>
                    <seat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-bold text-[#0F2A44]">{seat.title}</h3>
                    <p className="text-xs text-gray-500">
                      {seat.jurisdiction} Level &middot; {seat.area}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", seat.color)}>
                      {seat.jurisdiction}
                    </span>
                    <span className="text-xs font-mono text-[#1D6B3F] font-semibold">
                      {seat.spendingLimit}
                    </span>
                  </div>
                  {expandedSeat === seat.key ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {expandedSeat === seat.key && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    {/* Description */}
                    <div className="mt-4 mb-5">
                      <p className="text-sm text-gray-600 leading-relaxed">{seat.description}</p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      <InfoCard label="Spending Limit" value={seat.spendingLimit} icon="💰" />
                      <InfoCard label="Term Length" value={seat.term} icon="📅" />
                      <InfoCard label="ECFA Reference" value={seat.ecfaRef} icon="📋" />
                      <InfoCard label="Elected By" value={seat.electedBy} icon="🗳️" />
                    </div>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Requirements */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-[#2E75B6] uppercase tracking-wider mb-3">
                          Eligibility Requirements
                        </h4>
                        <ul className="space-y-2">
                          {seat.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#2E75B6] shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Regulations */}
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-[#ED8936] uppercase tracking-wider mb-3">
                          Key ECFA Regulations
                        </h4>
                        <ul className="space-y-2">
                          {seat.keyRegulations.map((reg, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <AlertTriangle className="h-3.5 w-3.5 text-[#ED8936] shrink-0 mt-0.5" />
                              <span>{reg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Campaign Areas */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-[#1D6B3F] uppercase tracking-wider mb-3">
                          Campaign Coverage Areas
                        </h4>
                        <ul className="space-y-2">
                          {seat.campaignAreas.map((area, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <MapPin className="h-3.5 w-3.5 text-[#1D6B3F] shrink-0 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}

          {filteredSeats.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No election seats match your search</p>
            </div>
          )}
        </div>
      )}

      {/* Platform Guide Section */}
      {activeSection === "platform" && (
        <div className="space-y-4">
          {filteredGuides.map((guide, index) => (
            <FadeIn key={guide.key} direction="up" delay={0.1 + index * 0.03}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedGuide(expandedGuide === guide.key ? null : guide.key)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <guide.icon className="h-5 w-5 text-[#2E75B6] shrink-0" />
                  <h3 className="text-sm font-bold text-[#0F2A44] flex-1 text-left">{guide.title}</h3>
                  <span className="text-xs text-gray-400 mr-2">{guide.items.length} topics</span>
                  {expandedGuide === guide.key ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {expandedGuide === guide.key && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {guide.items.map((item, i) => (
                      <div key={i} className="px-5 py-4">
                        <p className="text-sm font-medium text-[#0F2A44] mb-1.5">{item.q}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}

          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No help topics match your search</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Support */}
      <FadeIn direction="up" delay={0.3}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <HelpCircle className="h-8 w-8 text-[#2E75B6] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0F2A44]">Need More Help?</h3>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Contact our support team for assistance with KURA360 or ECFA compliance questions
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:support@kura360.co.ke"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E75B6] text-white rounded-lg text-xs font-medium hover:bg-[#2E75B6]/90 transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+254700000000"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#0F2A44] rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Call +254 700 000 000
            </a>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

/* ── Helper Components ── */
function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xs font-semibold text-[#0F2A44]">{value}</p>
    </div>
  );
}
