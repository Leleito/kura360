export const metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <div>
      <h1 className="text-lg font-bold text-navy mb-4">
        Campaign Finance — Expenditure Ledger
      </h1>
      <p className="text-sm text-text-secondary">
        Finance module coming in MVP Week 1-4. Track all campaign income and
        expenditure, generate IEBC compliance reports, and maintain audit trails.
      </p>
    </div>
  );
}
