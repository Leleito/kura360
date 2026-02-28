"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Users,
  Bell,
  CreditCard,
  Shield,
  Smartphone,
  Globe,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
} from "lucide-react";
import { cn, formatKES, formatPhone } from "@/lib/utils";
import { FadeIn } from "@/components/premium";

/* ── Mock data ── */
const campaignProfile = {
  candidateName: "Hon. James Mwangi Kariuki",
  party: "Democratic Alliance Party",
  position: "Governor",
  county: "Nairobi",
  constituency: "Westlands",
  ward: "Parklands/Highridge",
  spendingLimitKes: 35_000_000,
  bankName: "KCB Bank",
  bankAccount: "****4521",
  donationSlug: "jmk-governor-2027",
  subscriptionTier: "professional",
  phone: "+254712345678",
  email: "campaign@jmkgovernor.co.ke",
};

const teamMembers = [
  { id: "1", name: "Sarah Wambui", role: "finance_officer", email: "sarah@campaign.co.ke", status: "active" },
  { id: "2", name: "Peter Otieno", role: "agent_coordinator", email: "peter@campaign.co.ke", status: "active" },
  { id: "3", name: "Grace Nyokabi", role: "viewer", email: "grace@campaign.co.ke", status: "active" },
  { id: "4", name: "Ali Hassan", role: "finance_officer", email: "ali@campaign.co.ke", status: "invited" },
];

const roleLabels: Record<string, string> = {
  campaign_owner: "Campaign Owner",
  finance_officer: "Finance Officer",
  agent_coordinator: "Agent Coordinator",
  agent: "Field Agent",
  viewer: "Viewer",
};

const roleColors: Record<string, string> = {
  campaign_owner: "bg-purple-100 text-[#805AD5]",
  finance_officer: "bg-blue-100 text-[#2E75B6]",
  agent_coordinator: "bg-orange-100 text-[#ED8936]",
  agent: "bg-green-100 text-[#1D6B3F]",
  viewer: "bg-gray-100 text-gray-600",
};

type SettingsTab = "profile" | "team" | "notifications" | "billing" | "security";

const tabs: { key: SettingsTab; label: string; icon: typeof Settings }[] = [
  { key: "profile", label: "Campaign Profile", icon: User },
  { key: "team", label: "Team Members", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "billing", label: "Billing & Plan", icon: CreditCard },
  { key: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="none">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2A44] flex items-center gap-2">
            <Settings className="h-7 w-7 text-gray-400" />
            Campaign Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your campaign profile, team, and preferences
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.key
                    ? "bg-[#0F2A44] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "team" && <TeamSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "billing" && <BillingSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileSettings() {
  return (
    <div className="space-y-6">
      {/* Candidate Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-4">Candidate Information</h2>
        <div className="flex items-start gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-[#0F2A44] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            JM
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F2A44]">{campaignProfile.candidateName}</h3>
            <p className="text-sm text-gray-500">{campaignProfile.party}</p>
            <button className="mt-2 text-xs text-[#2E75B6] hover:underline flex items-center gap-1">
              <Camera className="h-3 w-3" /> Change photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsField icon={Building2} label="Position" value={campaignProfile.position} />
          <SettingsField icon={MapPin} label="County" value={campaignProfile.county} />
          <SettingsField icon={MapPin} label="Constituency" value={campaignProfile.constituency} />
          <SettingsField icon={MapPin} label="Ward" value={campaignProfile.ward} />
          <SettingsField icon={Phone} label="Phone" value={formatPhone(campaignProfile.phone)} />
          <SettingsField icon={Mail} label="Email" value={campaignProfile.email} />
        </div>
      </div>

      {/* Financial */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-4">Financial Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsField icon={CreditCard} label="Spending Limit" value={formatKES(campaignProfile.spendingLimitKes)} />
          <SettingsField icon={Building2} label="Bank" value={`${campaignProfile.bankName} (${campaignProfile.bankAccount})`} />
          <SettingsField icon={Globe} label="Donation Portal" value={`kura360.co.ke/donate/${campaignProfile.donationSlug}`} />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D6B3F] text-white rounded-lg text-sm font-medium hover:bg-[#1D6B3F]/90 transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── Team Tab ── */
function TeamSettings() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F2A44]">Team Members</h2>
            <p className="text-xs text-gray-500 mt-0.5">{teamMembers.length} members</p>
          </div>
          <button className="px-3 py-2 bg-[#1D6B3F] text-white rounded-lg text-xs font-medium hover:bg-[#1D6B3F]/90 transition-colors">
            + Invite Member
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {teamMembers.map((member) => (
            <div key={member.id} className="px-5 py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0F2A44] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F2A44]">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", roleColors[member.role])}>
                {roleLabels[member.role]}
              </span>
              {member.status === "invited" && (
                <span className="text-xs bg-yellow-100 text-[#ED8936] px-2 py-0.5 rounded-full font-medium">
                  Pending
                </span>
              )}
              <button className="text-gray-400 hover:text-[#0F2A44]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Roles Legend */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#0F2A44] mb-2">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div><strong>Finance Officer:</strong> Record/verify transactions, manage donations</div>
          <div><strong>Agent Coordinator:</strong> Manage agents, assign stations, view reports</div>
          <div><strong>Field Agent:</strong> Check in, upload evidence, report incidents</div>
          <div><strong>Viewer:</strong> Read-only access to dashboard and reports</div>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications Tab ── */
function NotificationSettings() {
  const notifications = [
    { id: "spending-alerts", label: "Spending threshold alerts", description: "Get notified at 50%, 80%, 95% of spending limit", enabled: true },
    { id: "donation-received", label: "New donation received", description: "Notification when a new donation is recorded", enabled: true },
    { id: "flagged-items", label: "Flagged transaction alerts", description: "Immediate alert when a transaction or donation is flagged", enabled: true },
    { id: "agent-checkin", label: "Agent check-in updates", description: "Notification when agents check in at polling stations", enabled: false },
    { id: "evidence-upload", label: "Evidence uploads", description: "Alert when new evidence is uploaded to the vault", enabled: false },
    { id: "compliance-reports", label: "Compliance report reminders", description: "Reminders before ECFA filing deadlines", enabled: true },
    { id: "team-activity", label: "Team activity", description: "Updates when team members take actions", enabled: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-[#0F2A44]">Notification Preferences</h2>
        <p className="text-xs text-gray-500 mt-0.5">Choose what alerts you receive via SMS and in-app</p>
      </div>
      <div className="divide-y divide-gray-50">
        {notifications.map((notif) => (
          <div key={notif.id} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F2A44]">{notif.label}</p>
              <p className="text-xs text-gray-500">{notif.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <Smartphone className="h-3 w-3" /> SMS
                <input type="checkbox" defaultChecked={notif.enabled} className="h-4 w-4 rounded accent-[#1D6B3F]" />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <Bell className="h-3 w-3" /> In-app
                <input type="checkbox" defaultChecked={notif.enabled} className="h-4 w-4 rounded accent-[#1D6B3F]" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Billing Tab ── */
function BillingSettings() {
  const plans = [
    { tier: "starter", name: "Starter", price: "Free", features: ["1 campaign", "Basic dashboard", "Up to 10 agents", "Email support"] },
    { tier: "professional", name: "Professional", price: "KES 9,999/mo", features: ["Unlimited agents", "Evidence vault", "Compliance dashboard", "SMS notifications", "Priority support"], current: true },
    { tier: "enterprise", name: "Enterprise", price: "Custom", features: ["Multi-campaign", "Party-level console", "API access", "Dedicated support", "Custom integrations"] },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-1">Current Plan</h2>
        <p className="text-sm text-gray-500 mb-4">You are on the <strong className="text-[#1D6B3F]">Professional</strong> plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                "rounded-xl border-2 p-4",
                plan.current ? "border-[#1D6B3F] bg-green-50" : "border-gray-200"
              )}
            >
              <h3 className="text-sm font-bold text-[#0F2A44]">{plan.name}</h3>
              <p className="text-lg font-bold text-[#0F2A44] mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-[#1D6B3F]" /> {f}
                  </li>
                ))}
              </ul>
              {plan.current ? (
                <p className="mt-3 text-xs font-medium text-[#1D6B3F]">Current Plan</p>
              ) : (
                <button className="mt-3 text-xs font-medium text-[#2E75B6] hover:underline">
                  {plan.tier === "enterprise" ? "Contact Sales" : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Security Tab ── */
function SecuritySettings() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-[#0F2A44]">Phone Number (Login)</p>
              <p className="text-xs text-gray-500">{formatPhone(campaignProfile.phone)}</p>
            </div>
            <button className="text-xs text-[#2E75B6] hover:underline">Change</button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-[#0F2A44]">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">OTP via SMS is enabled by default</p>
            </div>
            <span className="text-xs bg-green-100 text-[#1D6B3F] px-2 py-0.5 rounded-full font-medium">Enabled</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-[#0F2A44]">Active Sessions</p>
              <p className="text-xs text-gray-500">1 active session on this device</p>
            </div>
            <button className="text-xs text-[#E53E3E] hover:underline">Revoke All</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-[#0F2A44]">Audit Log Access</p>
              <p className="text-xs text-gray-500">View all actions taken on this campaign</p>
            </div>
            <button className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1">
              View Log <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-[#E53E3E] mb-2">Danger Zone</h2>
        <p className="text-xs text-gray-600 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-[#E53E3E] text-[#E53E3E] rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
            Deactivate Campaign
          </button>
          <button className="px-4 py-2 border border-[#E53E3E] text-[#E53E3E] rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
            Export All Data
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared helper ── */
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-[#0F2A44]">{value}</p>
      </div>
    </div>
  );
}
