# IDE Daily/Weekly Active Users Chart Blocks - Layout Research

## 1. Chart Block Locations

### Primary Location: CopilotUsagePage
**File:** [web/src/pages/CopilotUsagePage.tsx](web/src/pages/CopilotUsagePage.tsx#L345-L360)

- **"IDE daily active users"** chart - Line 347
  - Component: `AreaChartCard`
  - Location in grid: Row 1 (first position)
  
- **"IDE weekly active users"** chart - Line 354
  - Component: `DynamicStackedBarChart`
  - Location in grid: Row 1 (second position)

### Secondary Location: OverviewPage
**File:** [web/src/pages/OverviewPage.tsx](web/src/pages/OverviewPage.tsx#L268)

- Text mention: "IDE Weekly Active Users breakdown" (informational only, no actual chart rendered on this page)

---

## 2. Grid/Layout Configuration

### Container Structure
**Parent Grid Container** (Row 1) - [CopilotUsagePage.tsx#L345](web/src/pages/CopilotUsagePage.tsx#L345)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
```

**Tailwind Classes Breakdown:**
| Class | Purpose | Value |
|-------|---------|-------|
| `grid` | Display: grid | CSS Grid layout |
| `grid-cols-1` | Mobile (default) | 1 column |
| `lg:grid-cols-2` | Large screens (1024px+) | 2 columns |
| `gap-4` | Gutter spacing | 1rem (16px) |
| `mb-4` | Margin bottom | 1rem (16px) |

### Responsive Breakpoints
- **Mobile (< 1024px):** 1 column layout (stacked vertically)
- **Large (≥ 1024px):** 2 columns layout (side by side)
- **Tailwind Default Breakpoints Used:**
  - `lg` = 1024px (standard Tailwind breakpoint)

---

## 3. Chart Container Components

### 3.1 "IDE daily active users" - AreaChartCard
**File:** [web/src/components/AreaChartCard.tsx](web/src/components/AreaChartCard.tsx)

**Component Wrapper Styles:**
```tsx
className="bg-white dark:bg-dark-bgSecondary border border-github-border 
           dark:border-dark-border rounded-lg p-4 hover:shadow-cardHover 
           dark:hover:shadow-dark-card transition-shadow"
```

| Style Property | Value | Notes |
|---|---|---|
| **Background** | White (light) / `#161b22` (dark) | Matches GitHub Copilot Insights theme |
| **Border** | 1px, `#d0d7de` (light) / `#30363d` (dark) | Subtle borders |
| **Border Radius** | 8px (lg) | Rounded corners |
| **Padding** | 1rem (16px) all sides | Internal spacing |
| **Hover Shadow** | Custom cardHover shadow | Interactive feedback |

**Header Section:**
```tsx
<h3 className="text-base font-semibold text-github-text dark:text-dark-text mb-1">
  {title}
</h3>
<p className="text-xs text-github-textSecondary dark:text-dark-textSecondary mb-4">
  {subtitle}
</p>
```

| Element | Tailwind Classes | Purpose |
|---|---|---|
| Title | `text-base font-semibold` | 16px, bold heading |
| Subtitle | `text-xs` | 12px, muted text color |
| Title Margin | `mb-1` | 4px spacing below title |
| Subtitle Margin | `mb-4` | 16px spacing below subtitle before chart |

**Chart Container:**
```tsx
<div className="h-64">
```

| Property | Value | Details |
|---|---|---|
| **Height** | `h-64` | 256px fixed height |
| **Responsive Container** | `ResponsiveContainer` (Recharts) | width="100%" height="100%" |
| **Chart Margin** | `{ top: 10, right: 10, left: 0, bottom: 0 }` | 10px top/right spacing |

**Recharts Configuration:**
- **Chart Type:** AreaChart
- **Data Key:** "date" (x-axis), "value" (y-axis)
- **Y-Axis Label:** "Users" (configurable, defaults in CopilotUsagePage)
- **Custom Colors:**
  - Light theme: `#2563eb` (blue)
  - Dark theme: `#58a6ff` (lighter blue)
- **Grid Lines:** Dashed, color matches theme
- **Axis Labels:** 11px font size, theme-matched colors
- **Area Fill:** Gradient from 30% opacity (top) to 5% opacity (bottom)

### 3.2 "IDE weekly active users" - DynamicStackedBarChart
**File:** [web/src/components/DynamicStackedBarChart.tsx](web/src/components/DynamicStackedBarChart.tsx)

**Component Wrapper Styles:**
```tsx
className="bg-white dark:bg-dark-bgSecondary border border-github-border 
           dark:border-dark-border rounded-lg p-4 hover:shadow-cardHover 
           dark:hover:shadow-dark-card transition-shadow"
```

*Identical to AreaChartCard wrapper*

**Header Section:**
```tsx
<h3 className="text-base font-semibold text-github-text dark:text-dark-text mb-1">
  {title}
</h3>
<p className="text-xs text-github-textSecondary dark:text-dark-textSecondary mb-4">
  {subtitle}
</p>
```

*Identical to AreaChartCard*

**Legend Section (Unique to DynamicStackedBarChart):**
```tsx
<div className="flex items-center gap-4 flex-wrap mb-4">
  {bars.map((bar) => (
    <div key={bar.key} className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: bar.color }} />
      <span className="text-xs text-github-textSecondary 
                       dark:text-dark-textSecondary">
        {bar.name}
      </span>
    </div>
  ))}
</div>
```

| Element | Tailwind Classes | Purpose |
|---|---|---|
| Legend Container | `flex items-center gap-4 flex-wrap mb-4` | Horizontal, wrapping legend |
| Legend Gap | `gap-4` | 1rem (16px) spacing between items |
| Legend Margin | `mb-4` | 16px spacing before chart |
| Color Box | `w-3 h-3 rounded-sm` | 12px × 12px color indicator |
| Label Item Gap | `gap-1.5` | 6px between color box and text |

**Chart Container:**
```tsx
<div className="h-64">
```

*Same as AreaChartCard: 256px fixed height*

**Recharts Configuration:**
- **Chart Type:** BarChart (stacked)
- **Data Key:** Configurable via `xAxisKey` prop
- **Stack ID:** "a" (stacks all bars together)
- **Bar Radius:** `[2, 2, 0, 0]` (top corners only, on last bar)
- **Y-Axis Formatter:** Formats large numbers as "k" (e.g., "10k")
- **Y-Axis Label:** Configurable, e.g., "Users"
- **Custom Colors:** Defined by `bars` configuration (IDE colors)
  - VS Code: `#007ACC` (blue)
  - JetBrains: `#E95420` (orange)
  - Visual Studio: `#5C2D91` (purple)
  - Neovim: `#57A143` (green)
  - Vim: `#019733` (green)
  - Xcode: `#147EFB` (blue)

---

## 4. IDE Color Configuration

**Location:** [web/src/pages/CopilotUsagePage.tsx#L62-L73](web/src/pages/CopilotUsagePage.tsx#L62-L73)

```tsx
const IDE_COLORS: Record<string, string> = {
  'vscode': '#007ACC',
  'jetbrains': '#E95420',
  'visualstudio': '#5C2D91',
  'neovim': '#57A143',
  'vim': '#019733',
  'xcode': '#147EFB',
  'azure_data_studio': '#0078D4',
  'eclipse': '#2C2255',
};
```

These colors are used in the `ideBars` configuration:
```tsx
const ideBars = ideNames.map((ide, index) => ({
  key: ide,
  name: ide,
  color: IDE_COLORS[ide] || `hsl(${index * 45}, 70%, 50%)`
}));
```

**Color Fallback:** If IDE not in colors map, generates HSL color with fallback formula

---

## 5. Data Transformation

**IDE Weekly Data Processing** - [CopilotUsagePage.tsx#L138-L152](web/src/pages/CopilotUsagePage.tsx#L138-L152)

```tsx
const ideWeeklyData = useMemo(() => {
  if (!ideWeeklyActiveUsers || ideWeeklyActiveUsers.length === 0) return [];
  
  const weekMap = new Map<string, Record<string, number>>();
  for (const row of ideWeeklyActiveUsers) {
    if (!weekMap.has(row.week_start)) {
      weekMap.set(row.week_start, { date: row.week_start } as any);
    }
    const week = weekMap.get(row.week_start)!;
    week[row.ide] = row.users;
  }
  return Array.from(weekMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}, [ideWeeklyActiveUsers]);
```

**Data Structure:**
- Input: Array of `{ week_start, ide, users }`
- Output: Array of `{ date: week_start, [ide]: users, ... }`
- Sorting: Chronological by week_start

---

## 6. Raw Container Structure (CopilotUsagePage)

**Full Page Container:**
```tsx
<div className="max-w-7xl">  // 1280px max width
```

**Main Content Flow:**
1. **Header** - Page title, controls
2. **Stats Cards** - `grid grid-cols-1 md:grid-cols-3 gap-4 mb-6`
3. **First Chart Row** (IDE charts) - `grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4`
   - AreaChartCard (IDE daily active users)
   - DynamicStackedBarChart (IDE weekly active users)
4. **Second Chart Row** - Full width chart
5. **Additional Charts** - Various configurations

---

## 7. Potential Layout Issues Identified

### Issue 1: Asymmetric Breakpoint Usage
**Problem:** IDE chart row uses `lg:grid-cols-2` while stats row uses `md:grid-cols-3`

```
Stats cards:     grid-cols-1 md:grid-cols-3        (breakpoint: 768px)
IDE charts:      grid-cols-1 lg:grid-cols-2        (breakpoint: 1024px)
```

**Impact:** On medium screens (768px-1023px):
- Stats cards: 3 columns
- IDE charts: 1 column (still stacked)
- Visual inconsistency in layout

---

### Issue 2: Legend Wrapping in DynamicStackedBarChart
**Problem:** When there are many IDE options, the legend can wrap to multiple lines, consuming extra vertical space

```tsx
<div className="flex items-center gap-4 flex-wrap mb-4">
```

The `flex-wrap` causes legend items to wrap. With 8 IDE options + gap-4 (16px), the legend can take 40px+ depending on screen width.

**Visual Impact:**
- On narrow screens: Legend wraps to 2-3 lines
- Reduces available chart space proportion
- Can make charts appear cramped relative to legend

---

### Issue 3: Fixed Chart Height (256px)
**Problem:** Both charts use fixed `h-64` (256px) height

```tsx
<div className="h-64">
```

**Impact:**
- Charts don't scale responsively to container size
- On mobile/tablets with less screen space, charts take up significant portion
- Legend in DynamicStackedBarChart takes percentage of fixed height
- No responsive scaling for different viewport heights

---

### Issue 4: Inconsistent Component Hover States
**Problem:** Both components use the same hover shadows, but their visual feedback behavior differs

- AreaChartCard: Smooth hover shadow
- DynamicStackedBarChart: Same, but legend changes might not be obvious

---

## 8. Responsive Breakpoint Configuration

**Tailwind Configuration:** [web/tailwind.config.js](web/tailwind.config.js)

Using Tailwind's **default breakpoints** (no custom overrides):
| Breakpoint | Size | Used In |
|---|---|---|
| `sm` | 640px | Not explicitly used for IDE charts |
| `md` | 768px | Stats cards `md:grid-cols-3` |
| `lg` | 1024px | IDE charts `lg:grid-cols-2` |
| `xl` | 1280px | Some chart grids |
| `2xl` | 1536px | Not used |

---

## 9. Shadow and Hover Effects

**Defined in tailwind.config.js:**

```javascript
boxShadow: {
  card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  cardHover: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
  dropdown: '0 8px 24px rgba(149,157,165,0.2)',
  'dark-dropdown': '0 8px 24px rgba(0,0,0,0.4)',
  'dark-card': '0 0 0 1px rgba(48,54,61,0.5)',
}
```

**Applied to chart cards:**
```tsx
hover:shadow-cardHover dark:hover:shadow-dark-card transition-shadow
```

- Light mode hover: Medium depth shadow
- Dark mode hover: Border highlight instead of shadow
- Transition: Smooth animation

---

## 10. Chart Libraries and Versions

**Chart Library:** Recharts

**Used Components:**
- `AreaChart` - For "IDE daily active users"
- `BarChart` - For "IDE weekly active users"
- Both wrapped in `ResponsiveContainer` for responsive sizing

**Key Recharts Features Used:**
- `CartesianGrid` with dashed lines
- `XAxis` with date formatting
- `YAxis` with custom label
- `Tooltip` with custom components
- `Area` with gradient fills (AreaChartCard)
- `Bar` with stacking (DynamicStackedBarChart)

---

## 11. CSS/Tailwind Classes Summary

### Common Classes Applied to Both Charts
```
bg-white dark:bg-dark-bgSecondary                  // Background
border border-github-border dark:border-dark-border // Borders
rounded-lg                                         // Border radius (8px)
p-4                                                // Padding (16px)
hover:shadow-cardHover dark:hover:shadow-dark-card // Hover effect
transition-shadow                                  // Smooth transition
h-64                                               // Fixed height (256px)
```

### Layout Hierarchy
```
CopilotUsagePage (max-w-7xl)
└── Chart Row (grid grid-cols-1 lg:grid-cols-2 gap-4)
    ├── AreaChartCard
    │   ├── Header (title + subtitle)
    │   └── Chart Container
    │       └── AreaChart (Recharts)
    └── DynamicStackedBarChart
        ├── Header (title + subtitle)
        ├── Legend (flex flex-wrap)
        └── Chart Container
            └── BarChart (Recharts)
```

---

## 12. Summary of Findings

| Aspect | Finding |
|--------|---------|
| **File Paths** | `web/src/pages/CopilotUsagePage.tsx` (lines 345-360), `web/src/components/AreaChartCard.tsx`, `web/src/components/DynamicStackedBarChart.tsx` |
| **Layout Type** | CSS Grid, 2-column on large screens (1024px+), 1-column on mobile |
| **Gap/Spacing** | `gap-4` (16px) between cards, `p-4` (16px) padding inside |
| **Chart Height** | Fixed `h-64` (256px) for both charts |
| **Responsive** | `grid-cols-1 lg:grid-cols-2` (breakpoint at 1024px) |
| **Chart Library** | Recharts (AreaChart, BarChart components) |
| **Colors** | Theme-aware (light/dark mode with GitHub colors) |
| **Issues** | Asymmetric breakpoints, fixed heights, legend wrapping affects chart proportions |

---

## 13. Recommendations for Future Improvements

1. **Align breakpoints:** Use `md:grid-cols-2` for consistency
2. **Responsive chart heights:** Consider using relative heights (e.g., `h-72 lg:h-96`)
3. **Legend optimization:** Consider collapsible or vertical legend for DynamicStackedBarChart
4. **Mobile view:** Test on various device sizes to ensure readability
