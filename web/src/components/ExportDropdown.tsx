import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';

export type ExportFormat = 'json' | 'ndjson' | 'csv';

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

export function ExportDropdown({ onExport, isExporting = false }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-1 p-2 hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary border border-github-border dark:border-dark-border rounded-md transition-colors disabled:opacity-50"
        title="Export data"
      >
        <Download size={16} className="text-github-textSecondary dark:text-dark-textSecondary" />
        <ChevronDown size={12} className="text-github-textSecondary dark:text-dark-textSecondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-github-textSecondary dark:text-dark-textSecondary uppercase tracking-wide border-b border-github-border dark:border-dark-border">
              Export Format
            </div>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-github-text dark:text-dark-text hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary transition-colors"
            >
              <FileJson size={16} className="text-blue-500" />
              <div className="text-left">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-github-textSecondary dark:text-dark-textSecondary">Standard JSON array</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('ndjson')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-github-text dark:text-dark-text hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary transition-colors"
            >
              <FileJson size={16} className="text-orange-500" />
              <div className="text-left">
                <div className="font-medium">NDJSON</div>
                <div className="text-xs text-github-textSecondary dark:text-dark-textSecondary">Newline-delimited JSON</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-github-text dark:text-dark-text hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary transition-colors"
            >
              <FileSpreadsheet size={16} className="text-green-500" />
              <div className="text-left">
                <div className="font-medium">CSV</div>
                <div className="text-xs text-github-textSecondary dark:text-dark-textSecondary">Spreadsheet format</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility functions for exporting data
export function convertToJSON<T extends Record<string, unknown>>(data: T[]): string {
  return JSON.stringify(data, null, 2);
}

export function convertToNDJSON<T extends Record<string, unknown>>(data: T[]): string {
  return data.map(item => JSON.stringify(item)).join('\n');
}

export function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return '';

  // Get all unique headers from all objects
  const headers = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Create header row
  const headerRow = headers.map(h => escapeCSVField(String(h))).join(',');

  // Create data rows
  const dataRows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return escapeCSVField(JSON.stringify(value));
      return escapeCSVField(String(value));
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

function escapeCSVField(field: string): string {
  // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
