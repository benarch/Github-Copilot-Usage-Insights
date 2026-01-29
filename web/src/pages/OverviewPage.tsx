export function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-github-text dark:text-dark-text mb-6">
        Overview
      </h1>
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg p-8">
        <p className="text-github-textSecondary dark:text-dark-textSecondary">
          Enterprise overview coming soon. Navigate to <strong>Insights</strong> to view Copilot usage data.
        </p>
      </div>
    </div>
  );
}
