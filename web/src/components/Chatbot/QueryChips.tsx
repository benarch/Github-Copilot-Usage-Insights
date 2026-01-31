interface QueryChipsProps {
  onQuerySelect: (query: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUERIES = [
  'Top 10 active users this week',
  'Most used IDEs',
  'Show agent adoption statistics',
  'What models are being used?',
  'Show usage trends',
  'Show daily usage summary',
];

export function QueryChips({ onQuerySelect, disabled }: QueryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUERIES.map((query) => (
        <button
          key={query}
          onClick={() => onQuerySelect(query)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs bg-github-bgSecondary dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-full hover:bg-github-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-github-text dark:text-dark-text"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
