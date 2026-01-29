import { ExternalLink } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  link?: {
    text: string;
    href: string;
  };
  progress?: {
    percentage: number;
    label: string;
  };
}

export function StatsCard({ title, value, subtitle, link, progress }: StatsCardProps) {
  return (
    <div className="bg-white border border-github-border rounded-lg p-4 hover:shadow-cardHover transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-github-text">{title}</h3>
        {link && (
          <a 
            href={link.href} 
            className="text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            {link.text}
            <ExternalLink size={10} />
          </a>
        )}
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-semibold text-github-text">{value}</span>
        {progress && (
          <span className="ml-2 text-sm text-github-textSecondary">
            {progress.label}
          </span>
        )}
      </div>
      
      {progress && (
        <div className="mb-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success-500 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}
      
      {subtitle && (
        <p className="text-xs text-github-textSecondary leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
