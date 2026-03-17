"use client";

import { useState, useEffect, useCallback } from "react";
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
  MapPin,
  Building2,
  Save,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import { cn, formatKES } from "@/lib/utils";
import { RoleGate } from '@/lib/rbac';
import { FadeIn } from "@/components/premium";
import { useCampaign } from "@/lib/campaign-context";
import { useToast } from "@/components/ui/toast";
import { updateCampaign } from "@/lib/actions/campaigns";
import {
  getCampaignMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  type TeamMember,
} from "@/lib/actions/team";

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

const assignableRoles = [
  { value: "finance_officer", label: "Finance Officer" },
  { value: "agent_coordinator", label: "Agent Coordinator" },
  { value: "agent", label: "Field Agent" },
  { value: "viewer", label: "Viewer" },
];

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
  const { campaign, refreshCampaigns } = useCampaign();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");
  const [position, setPosition] = useState("");
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [donationSlug, setDonationSlug] = useState("");

  // Sync form state when campaign data loads
  useEffect(() => {
    if (campaign) {
      setCandidateName(campaign.candidate_name ?? "");
      setParty(campaign.party ?? "");
      setPosition(campaign.position ?? "");
      setCounty(campaign.county ?? "");
      setConstituency(campaign.constituency ?? "");
      setWard(campaign.ward ?? "");
      setSpendingLimit(campaign.spending_limit_kes ?? 0);
      setBankName(campaign.bank_name ?? "");
      setBankAccount(campaign.bank_account_number ?? "");
      setDonationSlug(campaign.donation_portal_slug ?? "");
    }
  }, [campaign]);

  const handleSave = async () => {
    if (!campaign) return;
    setSaving(true);
    try {
      const { error } = await updateCampaign(campaign.id, {
        candidate_name: candidateName,
        party,
        position,
        county: county || null,
        constituency: constituency || null,
        ward: ward || null,
        spending_limit_kes: spendingLimit,
        bank_name: bankName || null,
        bank_account_number: bankAccount || null,
        donation_portal_slug: donationSlug || null,
      });
      if (error) {
        toast(error, "error");
      } else {
        toast("Campaign profile updated successfully", "success");
        setEditing(false);
        await refreshCampaigns();
      }
    } catch {
      toast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset to campaign values
    if (campaign) {
      setCandidateName(campaign.candidate_name ?? "");
      setParty(campaign.party ?? "");
      setPosition(campaign.position ?? "");
      setCounty(campaign.county ?? "");
      setConstituency(campaign.constituency ?? "");
      setWard(campaign.ward ?? "");
      setSpendingLimit(campaign.spending_limit_kes ?? 0);
      setBankName(campaign.bank_name ?? "");
      setBankAccount(campaign.bank_account_number ?? "");
      setDonationSlug(campaign.donation_portal_slug ?? "");
    }
  };

  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Candidate Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#0F2A44]">Candidate Information</h2>
          {!editing && (
            <RoleGate permission="settings:update">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#2E75B6] hover:underline font-medium"
              >
                Edit
              </button>
            </RoleGate>
          )}
        </div>
        <div className="flex items-start gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-[#0F2A44] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initials || "??"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F2A44]">{candidateName || "Not set"}</h3>
            <p className="text-sm text-gray-500">{party || "No party set"}</p>
            <button className="mt-2 text-xs text-[#2E75B6] hover:underline flex items-center gap-1">
              <Camera className="h-3 w-3" /> Change photo
            </button>
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableField label="Candidate Name" value={candidateName} onChange={setCandidateName} />
            <EditableField label="Party" value={party} onChange={setParty} />
            <EditableField label="Position" value={position} onChange={setPosition} />
            <EditableField label="County" value={county} onChange={setCounty} />
            <EditableField label="Constituency" value={constituency} onChange={setConstituency} />
            <EditableField label="Ward" value={ward} onChange={setWard} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField icon={Building2} label="Position" value={position || "Not set"} />
            <SettingsField icon={MapPin} label="County" value={county || "Not set"} />
            <SettingsField icon={MapPin} label="Constituency" value={constituency || "Not set"} />
            <SettingsField icon={MapPin} label="Ward" value={ward || "Not set"} />
          </div>
        )}
      </div>

      {/* Financial */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-4">Financial Settings</h2>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">ECFA Spending Limit (KES)</label>
              <input
                type="number"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              />
            </div>
            <EditableField label="Bank Name" value={bankName} onChange={setBankName} />
            <EditableField label="Bank Account" value={bankAccount} onChange={setBankAccount} />
            <EditableField label="Donation Portal Slug" value={donationSlug} onChange={setDonationSlug} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField icon={CreditCard} label="Spending Limit" value={formatKES(spendingLimit)} />
            <SettingsField icon={Building2} label="Bank" value={bankName ? `${bankName} (${bankAccount || "N/A"})` : "Not set"} />
            <SettingsField icon={Globe} label="Donation Portal" value={donationSlug ? `kura360.co.ke/donate/${donationSlug}` : "Not configured"} />
          </div>
        )}
      </div>

      {editing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D6B3F] text-white rounded-lg text-sm font-medium hover:bg-[#1D6B3F]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Team Tab ── */
function TeamSettings() {
  const { campaign } = useCampaign();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);

  const refreshMembers = useCallback(async () => {
    if (!campaign) return;
    try {
      const { data, error } = await getCampaignMembers(campaign.id);
      if (!error && data) setMembers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const handleInvite = async () => {
    if (!campaign || !inviteUserId.trim()) return;
    setInviting(true);
    try {
      const { error } = await inviteMember(campaign.id, inviteUserId.trim(), inviteRole);
      if (error) {
        toast(error, "error");
      } else {
        toast("Member invited successfully", "success");
        setShowInvite(false);
        setInviteUserId("");
        setInviteRole("viewer");
        await refreshMembers();
      }
    } catch {
      toast("Failed to invite member", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!campaign) return;
    try {
      const { error } = await updateMemberRole(campaign.id, memberId, newRole);
      if (error) {
        toast(error, "error");
      } else {
        toast("Role updated", "success");
        await refreshMembers();
      }
    } catch {
      toast("Failed to update role", "error");
    }
  };

  const handleRemove = async (memberId: string, role: string) => {
    if (!campaign) return;
    if (role === "campaign_owner") {
      toast("Cannot remove the campaign owner", "warning");
      return;
    }
    if (!confirm("Remove this team member?")) return;
    try {
      const { error } = await removeMember(campaign.id, memberId);
      if (error) {
        toast(error, "error");
      } else {
        toast("Member removed", "success");
        await refreshMembers();
      }
    } catch {
      toast("Failed to remove member", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F2A44]">Team Members</h2>
            <p className="text-xs text-gray-500 mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
          <RoleGate permission="campaign:manage_members">
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="px-3 py-2 bg-[#1D6B3F] text-white rounded-lg text-xs font-medium hover:bg-[#1D6B3F]/90 transition-colors inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Invite Member
            </button>
          </RoleGate>
        </div>

        {/* Invite Form */}
        {showInvite && (
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50/50">
            <p className="text-xs font-medium text-[#0F2A44] mb-3">Invite a new team member</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="User ID (UUID)"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              >
                {assignableRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteUserId.trim()}
                className="px-4 py-2 bg-[#1D6B3F] text-white rounded-lg text-sm font-medium hover:bg-[#1D6B3F]/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                {inviting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {inviting ? "Inviting…" : "Send Invite"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading team…
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No team members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map((member) => (
              <div key={member.id} className="px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#0F2A44] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {member.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F2A44] truncate">{member.user_id}</p>
                  <p className="text-xs text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                </div>
                {member.role === "campaign_owner" ? (
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", roleColors[member.role])}>
                    {roleLabels[member.role] ?? member.role}
                  </span>
                ) : (
                  <RoleGate permission="campaign:manage_members" fallback={
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", roleColors[member.role])}>
                      {roleLabels[member.role] ?? member.role}
                    </span>
                  }>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className={cn("text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer", roleColors[member.role])}
                    >
                      {assignableRoles.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </RoleGate>
                )}
                {member.role !== "campaign_owner" && (
                  <RoleGate permission="campaign:manage_members">
                    <button
                      onClick={() => handleRemove(member.id, member.role)}
                      className="text-gray-400 hover:text-[#E53E3E] transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </RoleGate>
                )}
              </div>
            ))}
          </div>
        )}
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
  const { campaign } = useCampaign();
  const currentTier = campaign?.subscription_tier ?? "starter";

  const plans = [
    { tier: "starter", name: "Starter", price: "Free", features: ["1 campaign", "Basic dashboard", "Up to 10 agents", "Email support"] },
    { tier: "pro", name: "Professional", price: "KES 9,999/mo", features: ["Unlimited agents", "Evidence vault", "Compliance dashboard", "SMS notifications", "Priority support"] },
    { tier: "enterprise", name: "Enterprise", price: "Custom", features: ["Multi-campaign", "Party-level console", "API access", "Dedicated support", "Custom integrations"] },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-[#0F2A44] mb-1">Current Plan</h2>
        <p className="text-sm text-gray-500 mb-4">
          You are on the <strong className="text-[#1D6B3F]">{plans.find((p) => p.tier === currentTier)?.name ?? currentTier}</strong> plan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                "rounded-xl border-2 p-4",
                plan.tier === currentTier ? "border-[#1D6B3F] bg-green-50" : "border-gray-200"
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
              {plan.tier === currentTier ? (
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
              <p className="text-xs text-gray-500">Managed via Supabase Auth</p>
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

/* ── Shared helpers ── */
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

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
      />
    </div>
  );
}
