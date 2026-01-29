import { Github } from 'lucide-react';

const footerLinks = [
  { label: 'Terms', href: 'https://docs.github.com/site-policy/github-terms' },
  { label: 'Privacy', href: 'https://docs.github.com/site-policy/privacy-policies' },
  { label: 'Security', href: 'https://github.com/security' },
  { label: 'Status', href: 'https://www.githubstatus.com/' },
  { label: 'Community', href: 'https://github.community/' },
  { label: 'Docs', href: 'https://docs.github.com' },
  { label: 'Contact', href: 'https://support.github.com' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-github-border dark:border-dark-border bg-white dark:bg-dark-bg py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3 text-github-textSecondary dark:text-dark-textSecondary">
            <Github size={20} className="text-github-textMuted dark:text-dark-textSecondary" />
            <span className="text-xs">© {currentYear} GitHub, Inc.</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-github-textSecondary dark:text-dark-textSecondary hover:text-primary-600 dark:hover:text-[#58a6ff] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button className="text-xs text-github-textSecondary dark:text-dark-textSecondary hover:text-primary-600 dark:hover:text-[#58a6ff] transition-colors">
              Manage cookies
            </button>
            <button className="text-xs text-github-textSecondary dark:text-dark-textSecondary hover:text-primary-600 dark:hover:text-[#58a6ff] transition-colors">
              Do not share my personal information
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
