import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="Campaign Balance"
          value="KES 12.4M"
          sub="of KES 433M limit (2.9%)"
          variant="green"
        />
        <StatCard
          label="Total Spent"
          value="KES 8.7M"
          sub="6 categories tracked"
          variant="blue"
        />
        <StatCard
          label="Agents Deployed"
          value="1,247"
          sub="of 1,580 assigned (79%)"
          variant="purple"
        />
        <StatCard
          label="Evidence Items"
          value="3,891"
          sub="All verified"
          variant="navy"
        />
        <StatCard
          label="Donations"
          value="KES 4.2M"
          sub="2,847 donors"
          variant="green"
        />
        <StatCard
          label="Compliance Score"
          value="94%"
          sub="4 items need attention"
          variant="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending by Category */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-4">
            Spending by Category vs. Limits
          </h2>
          <ProgressBar
            value={2.1}
            max={50}
            label="Venue Hire — KES 2.1M"
          />
          <ProgressBar
            value={3.4}
            max={80}
            label="Publicity Materials — KES 3.4M"
          />
          <ProgressBar
            value={1.8}
            max={40}
            label="Advertising — KES 1.8M"
          />
          <ProgressBar
            value={0.9}
            max={30}
            label="Transport — KES 0.9M"
          />
          <ProgressBar
            value={0.5}
            max={20}
            label="Personnel — KES 0.5M"
          />
        </div>

        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl p-4 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-3">
            Compliance Alerts
          </h2>
          <div className="space-y-2">
            {[
              {
                text: "Anonymous donation KES 8,000 — exceeds threshold",
                level: "critical" as const,
              },
              {
                text: "Transport spending at 82% of limit",
                level: "warning" as const,
              },
              {
                text: "Agent payment batch pending approval",
                level: "info" as const,
              },
              {
                text: "3 campaign materials not logged",
                level: "warning" as const,
              },
            ].map((alert, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-md text-xs leading-relaxed border-l-3 ${
                  alert.level === "critical"
                    ? "bg-red-pale text-red border-red"
                    : alert.level === "warning"
                      ? "bg-orange-pale text-amber-800 border-orange"
                      : "bg-surface-border-light text-text-secondary border-blue"
                }`}
              >
                {alert.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
