# Cloud Optimization Score - Project Documentation

## 1. Project One-Pager

### Goal & Users
- **Goal**: Multi-cloud and multi-SaaS optimization recommendation management system for tracking, filtering, and actioning cost-saving opportunities
- **Users**: Cloud/SaaS operations teams, FinOps practitioners, IT managers reviewing and implementing optimization recommendations
- **Current Status**: Fully functional dashboard with recommendations tracking, filtering, grouping, and status management
- **Live Environments**: Deployed on v0/Vercel (URLs redacted for security)

---

## 2. System Overview

### Architecture (ASCII)
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Next.js App)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌─────────────────┐   ┌────────────────┐ │
│  │   Sidebar    │───▶│     Header      │───▶│  Main Content  │ │
│  │ (Navigation) │    │  (Management    │   │                │ │
│  └──────────────┘    │   Type Toggle)  │   │  - Overview    │ │
│                      └─────────────────┘   │  - Dashboard   │ │
│                                            │  - Filters     │ │
│                                            └────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ManagementContext (Global State)                  │  │
│  │         - Multi-Cloud / Multi-SaaS toggle                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Data Layer (Client-Side Generated)                │  │
│  │  - lib/recommendations-data.ts (Cloud recommendations)    │  │
│  │  - lib/saas-recommendations-data.ts (SaaS recommendations)│  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Services/Modules
- **app/page.tsx**: Main entry point with routing logic (overview vs dashboard)
- **components/sidebar.tsx**: Navigation sidebar with category links
- **components/header.tsx**: Top header with management type toggle (Multi-Cloud/Multi-SaaS)
- **components/optimization-content.tsx**: Overview page with summary cards and charts
- **components/optimization-dashboard.tsx**: Main recommendations dashboard with filtering/grouping
- **components/recommendations-list.tsx**: Recommendations table/list component
- **components/recommendation-side-panel.tsx**: Detail panel for individual recommendations
- **lib/management-context.tsx**: React Context for management type state
- **lib/recommendations-data.ts**: Cloud recommendation data generator
- **lib/saas-recommendations-data.ts**: SaaS recommendation data generator

### Data Flow
1. User selects management type (Multi-Cloud/Multi-SaaS) in header
2. Context provider updates global state
3. Components read from appropriate data source (cloud or SaaS recommendations)
4. Filters/groupings applied on client-side
5. Recommendations displayed in table/cards with interactive controls
6. Status changes (Archive, Snooze, Action) update local state
7. URL parameters track current category/groupBy state

### Tech Stack & Versions
- **Framework**: Next.js 16 (App Router with React 19.2)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context API + URL search params
- **Data Storage**: Client-side generated data (seeded random generation)
- **Fonts**: Inter (sans), JetBrains Mono (mono)

---

## 3. Core Logic & Invariants

### Business Rules
1. **Recommendation Status Lifecycle**: New → Viewed → Marked for Review → Re-visit/Actioned/Archived/Snoozed
2. **Priority Calculation**: Based on savings amount ranges (category-dependent)
   - High-value categories (Reserved Instances, VM Optimisation): £20k-£100k = high, £8k-£20k = medium
   - Low-value categories (Database, Storage, Zombies): £5k-£8k = high, £2k-£5k = medium
   - Medium-value categories (Hybrid Benefit): £10k-£16k = high, £3k-£10k = medium
3. **Archive Expiration**: Archived items transition to "Re-visit" after 9 months
4. **Snooze Expiration**: Snoozed items transition to "Re-visit" when snooze period ends
5. **Category Filtering**: Only one category can be active at a time
6. **Sub-category Filtering**: Multiple sub-categories can be selected within a category

### Domain Entities & Relationships

**Recommendation Entity**:
\`\`\`typescript
interface Recommendation {
  id: number
  title: string
  description: string
  savings: number              // Numeric value for sorting/calculations
  savingsFormatted: string     // Display format (e.g., "£15,000")
  period: string              // "monthly saving" | "annual saving"
  provider: string            // "Microsoft Azure" | "Amazon Web Services" | "Google Cloud Platform"
  status: string              // "New" | "Viewed" | "Marked for review" | "Re-visit" | "Archived" | "Actioned" | "Snoozed"
  owner: string
  priority: string            // "high" | "medium" | "low"
  category: string            // Main category
  subCategory?: string        // Optional sub-category
  tagType: string
  tagValue: string
  easeToImplement: string     // "Easy" | "Medium" | "Hard"
  createdDate: string         // Formatted date string
  actionedDate?: string       // ISO date when actioned
  archiveNote?: {
    note: string
    owner: string
    timestamp: string
  }
  reviewNote?: {              // Also used for snooze notes
    note: string
    owner: string
    timestamp: string
  }
  snoozedUntil?: string       // ISO date for snooze expiration
  archivedUntil?: string      // ISO date for archive expiration (9 months)
}
\`\`\`

**Relationships**:
- Recommendation → Category (1:1, required)
- Recommendation → Sub-category (1:0..1, optional)
- Recommendation → Provider (1:1, required)
- Category → Sub-categories (1:many, predefined mappings)

### Non-Negotiable Constraints
1. **Data Consistency**: All recommendations must have valid priority, category, and status
2. **Filter Persistence**: Active filters must be preserved in URL and view state
3. **Status Exclusivity**: A recommendation can only have one status at a time
4. **Category-Subcategory Binding**: Sub-categories must belong to their parent category
5. **Date Validity**: Archive/snooze expiration dates must be valid ISO strings

---

## 4. APIs & Integrations

### Internal "APIs" (Client-Side Functions)

#### Data Generation
**Purpose**: Generate seeded random recommendations for demonstration
- **Function**: `generateRecommendations()` in `lib/recommendations-data.ts`
- **Response**: Array of Recommendation objects
- **Notes**: Uses seeded random (Mulberry32) for consistent data generation

#### Totals Calculation
**Purpose**: Calculate aggregate savings and counts
- **Function**: `calculateTotals(selectedStatuses?: Set<string>)`
- **Request**: Optional set of status filters
- **Response**: 
  \`\`\`typescript
  {
    totalSavings: number
    totalCount: number
    actionedSavings: number
    actionedCount: number
    categorySavings: Record<string, number>
  }
  \`\`\`

#### Priority Mapping
**Purpose**: Get priority for specific recommendations
- **Function**: `calculatePriorities()`
- **Response**: `Map<number, string>` (recommendation ID → priority)

### External Integrations
- **None currently**: All data is client-side generated
- **Future consideration**: REST API for fetching real cloud optimization data

---

## 5. Data Model

### Cloud Categories
\`\`\`typescript
const cloudCategories = [
  { id: "Reserved Instances", icon: Server, count: 5 },
  { id: "DEVUAT", icon: Zap, count: 2 },
  { id: "Hybrid Benefit", icon: Shield, count: 2 },
  { id: "Savings Plans", icon: DollarSign, count: 2 },
  { id: "VM Optimisation", icon: Cpu, count: 2 },
  { id: "Zombies", icon: Archive, count: 2 },
  { id: "Storage", icon: HardDrive, count: 2 },
  { id: "Database", icon: Database, count: 2 },
]
\`\`\`

### Sub-Category Mappings
\`\`\`typescript
const categorySubCategories: Record<string, string[]> = {
  "Reserved Instances": ["Cosmos DB", "Reserved VM", "SQL", "Synapse", "VM Instances"],
  DEVUAT: ["Development", "UAT", "Testing", "Staging"],
  "Hybrid Benefit": ["Windows Server", "SQL Server", "Linux"],
  "Savings Plans": ["Compute", "EC2", "Lambda", "Fargate"],
  "VM Optimisation": ["Underutilized", "Oversized", "Idle", "Right-sizing"],
  Zombies: ["Unattached Disks", "Idle Resources", "Orphaned Snapshots", "Unused IPs"],
  Storage: ["Blob Storage", "Disk Storage", "Archive Storage", "Backup Storage"],
  Database: ["SQL Database", "CosmosDB", "PostgreSQL", "MySQL"],
}
\`\`\`

### Example Records
\`\`\`typescript
{
  id: 1,
  title: "Virtual Machine #1",
  description: "gbl_produs_services • SR000001",
  savings: 45000,
  savingsFormatted: "£45,000",
  period: "annual saving",
  provider: "Microsoft Azure",
  status: "New",
  owner: "Chris Taylor",
  priority: "high",
  category: "Reserved Instances",
  subCategory: "Reserved VM",
  tagType: "type1",
  tagValue: "value1",
  easeToImplement: "Easy",
  createdDate: "Nov 10, 2025"
}
\`\`\`

---

## 6. State & Side Effects

### Client-Side State
1. **ManagementContext**: Global management type (Multi-Cloud/Multi-SaaS)
2. **URL Search Params**: Category filter, groupBy parameter
3. **Dashboard Local State**:
   - Filter selections (priority, status, provider, date range, tags)
   - View management (saved views, active view)
   - UI state (open popovers, search expansion)
   - Group by selection

### Caching Strategy
- **None explicit**: Data generated once on import, stored in module scope
- **Browser caching**: Standard Next.js static asset caching

### Idempotency Rules
- **Data generation**: Seeded random ensures consistent results across reloads
- **Status changes**: Local state only (no persistence), idempotent within session

### Error Handling Strategy
- **Missing context**: Throw error if useManagement called outside provider
- **Invalid filters**: Defensive filtering (skip invalid items)
- **Date parsing**: Graceful fallback for invalid date strings
- **No explicit error boundaries**: Rely on Next.js default error handling

---

## 7. UX/Behavioral Specs

### User Flows

#### 1. View Recommendations by Category
1. User clicks category in sidebar (e.g., "Reserved Instances")
2. URL updates with `?category=Reserved%20Instances`
3. Dashboard loads with category filter pre-applied
4. Sub-categories displayed as chips if available
5. User can select/deselect sub-categories

#### 2. Filter Recommendations
1. User clicks "Add Filter" button
2. Dropdown shows available filters
3. User selects filter type (e.g., Priority)
4. Filter chip appears with popover control
5. User selects values (e.g., High, Medium)
6. Table updates immediately

#### 3. Change Status
1. User hovers over recommendation row
2. Action buttons appear (Archive, Snooze, Action, etc.)
3. User clicks action button
4. Modal appears for confirmation/notes
5. User submits
6. Status updates, recommendation moves to appropriate view

#### 4. Group Recommendations
1. User clicks "Group by" dropdown
2. Selects grouping option (Priority, Provider, Category, Sub-category)
3. URL updates with `?groupBy=priority`
4. Recommendations re-render in grouped format

### Edge Cases
- **No recommendations**: Show empty state with helpful message
- **All filtered out**: Display "No recommendations match your filters"
- **Invalid category URL**: Fallback to first category
- **Expired archives**: Auto-transition to "Re-visit" status
- **Expired snoozes**: Auto-transition to "Re-visit" status

### Empty/Error/Loading States
- **Loading**: Suspense boundary with "Loading..." fallback
- **Empty category**: "No recommendations in this category"
- **No search results**: "No recommendations match your search"
- **Filtered to zero**: "Adjust filters to see recommendations"

### Accessibility Notes
- **Keyboard navigation**: All interactive elements focusable
- **ARIA labels**: Buttons and filters have descriptive labels
- **Color contrast**: Meets WCAG AA standards
- **Screen reader**: Status badges and priorities announced
- **Focus management**: Popovers trap focus when open

---

## 8. Configuration & Secrets (Redacted)

### Environment Variables
- **None currently required**: All data is client-side generated
- **Future considerations**:
  - `NEXT_PUBLIC_API_URL`: API endpoint for fetching recommendations
  - `API_KEY`: Authentication key for cloud provider APIs (server-side only)

### Local vs Production
- **Development**: Uses Next.js dev server (`npm run dev`)
- **Production**: Deployed to Vercel with automatic optimizations
- **No configuration differences**: Same code paths for both environments

---

## 9. Build/Run/Test

### Local Setup
\`\`\`bash
# Clone repository (if applicable)
# Install dependencies (auto-inferred in Next.js)

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Commands
- `npm run dev`: Start development server on localhost:3000
- `npm run build`: Create optimized production build
- `npm start`: Serve production build
- `npm run lint`: Run ESLint for code quality

### Test Strategy
- **Currently**: No automated tests
- **Recommended**:
  - Unit tests for data generation functions
  - Integration tests for filter logic
  - E2E tests for critical user flows (Playwright)
- **Representative test cases**:
  \`\`\`typescript
  // Data generation consistency
  test('generateRecommendations produces consistent results', () => {
    const data1 = generateRecommendations()
    const data2 = generateRecommendations()
    expect(data1).toEqual(data2) // Seeded random
  })
  
  // Filter logic
  test('filters recommendations by priority', () => {
    const filtered = applyFilters(allRecommendations, { priority: new Set(['high']) })
    expect(filtered.every(r => r.priority === 'high')).toBe(true)
  })
  
  // Status transitions
  test('expired archives transition to Re-visit', () => {
    const expired = { ...mockRecommendation, status: 'Archived', archivedUntil: pastDate }
    expect(getEffectiveStatus(expired)).toBe('Re-visit')
  })
  \`\`\`

---

## 10. Quality Bar

### Code Style
- **TypeScript**: Strict mode enabled
- **React**: Function components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **File structure**: Kebab-case for file names (e.g., `optimization-dashboard.tsx`)

### Lint/Format Rules
- **ESLint**: Next.js recommended config
- **Prettier**: (if configured) 2-space indentation, single quotes
- **Import order**: React → Next.js → Components → Lib → Types

### Performance Budgets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle size**: Keep under 300KB (gzipped)
- **Client-side filtering**: < 100ms for 1000+ recommendations

### Security/Posture Requirements
- **No sensitive data**: All data is demonstration/generated
- **Input validation**: Sanitize user input (search queries, notes)
- **XSS prevention**: Use React's built-in escaping
- **No authentication**: Public dashboard (add auth if needed)

---

## 11. Decision Log (ADR)

### [2025-01-10] Client-Side Data Generation
**Context**: Need demonstration data without backend API
**Decision**: Use seeded random generation for consistent, realistic data
**Alternatives**: Static JSON, mock API, localStorage
**Consequence**: Fast prototyping, no server needed, but can't persist changes

### [2025-01-10] URL-Based State for Category
**Context**: Users need shareable links to specific categories
**Decision**: Store active category in URL search params
**Alternatives**: Local state only, session storage
**Consequence**: Better UX (shareable), but more complexity in state management

### [2025-01-10] Controlled Popover Anti-Pattern Fix
**Context**: Filter buttons not working on live site (PopoverTrigger conflict)
**Decision**: Use PopoverTrigger with controlled state, remove manual onClick toggles
**Alternatives**: Uncontrolled popovers, custom dropdown component
**Consequence**: Buttons work correctly, simpler code, follows Radix UI patterns

### [2025-01-10] Context API for Management Type
**Context**: Need global state for Multi-Cloud/Multi-SaaS toggle
**Decision**: Use React Context with Provider at root
**Alternatives**: Props drilling, Zustand, Redux
**Consequence**: Simple, no extra dependencies, sufficient for small global state

### [2025-01-10] Category Sub-Category Mapping
**Context**: Need to organize recommendations hierarchically
**Decision**: Predefined mapping of categories to sub-categories
**Alternatives**: Dynamic categories from data, flat structure
**Consequence**: Easier filtering, consistent UI, but requires maintenance

---

## 12. Known Issues & TODOs

### Known Issues
1. **Filter buttons not working on live site** (Status: Investigating)
   - Works in preview/chat mode but not on published site
   - Console shows onClick fires but onOpenChange conflicts
   - Related to controlled Popover state management

2. **Tooltip color inconsistency** (Status: Fixed in v7)
   - Was showing blue (bg-primary) instead of dark gray
   - Fixed by using bg-gray-900 text-white

3. **Hydration mismatch warnings** (Status: Minor)
   - Occasional warnings due to date formatting differences
   - Not affecting functionality

### Tech Debt
1. **No data persistence**: Changes lost on reload (need backend or localStorage)
2. **Large component files**: optimization-dashboard.tsx is 2000+ lines (needs refactoring)
3. **Repeated code**: Similar filter logic in multiple dashboard variants
4. **No error boundaries**: Unhandled errors crash entire app
5. **Missing loading states**: Some operations lack proper loading indicators

### Open Questions
1. Should we persist filter preferences across sessions?
2. Do we need real-time updates for multi-user scenarios?
3. Should archived items be hidden by default or shown in separate view?
4. What's the ideal snooze duration (current: 1-6 months)?

---

## 13. Prompts That Work

### For Adding New Features
\`\`\`
"Add a new filter for [filter name] to the optimization dashboard. 
It should follow the same pattern as existing filters (Priority, Status) 
and use a controlled Popover with PopoverTrigger."
\`\`\`

### For Fixing Bugs
\`\`\`
"The [component name] is not working on the live site but works in preview. 
Please check for controlled component conflicts and ensure event handlers 
are properly bound. Add debug logging with console.log('[v0] ...')."
\`\`\`

### For Refactoring
\`\`\`
"The optimization-dashboard.tsx file is too large. Please extract the 
filter logic into a separate custom hook called useRecommendationFilters."
\`\`\`

### For Styling Changes
\`\`\`
"Update the [component name] to match the design system. Use semantic 
tokens (bg-background, text-foreground) and ensure proper contrast in 
both light and dark modes."
\`\`\`

---

## 14. Examples

### Adding a New Filter

**Input**: "Add a cost range filter to the dashboard"

**Output**:
\`\`\`typescript
// In optimization-dashboard.tsx

// 1. Add state
const [selectedCostRange, setSelectedCostRange] = useState<string>("all")

// 2. Add filter UI
<Popover
  open={openFilters.costRange}
  onOpenChange={(open) => toggleFilter("costRange", open)}
>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm">
      Cost Range
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <RadioGroup value={selectedCostRange} onValueChange={setSelectedCostRange}>
      <RadioGroupItem value="all">All</RadioGroupItem>
      <RadioGroupItem value="low">£0-£10k</RadioGroupItem>
      <RadioGroupItem value="medium">£10k-£50k</RadioGroupItem>
      <RadioGroupItem value="high">£50k+</RadioGroupItem>
    </RadioGroup>
  </PopoverContent>
</Popover>

// 3. Apply filter in getFilteredRecommendations
if (selectedCostRange !== "all") {
  filtered = filtered.filter((rec) => {
    if (selectedCostRange === "low") return rec.savings < 10000
    if (selectedCostRange === "medium") return rec.savings >= 10000 && rec.savings < 50000
    if (selectedCostRange === "high") return rec.savings >= 50000
    return true
  })
}
\`\`\`

### Debugging Controlled Popover Issue

**Input**: "Filter button clicks not registering"

**Output**:
\`\`\`typescript
// Add debug logging
<PopoverTrigger asChild>
  <Button
    variant="outline"
    size="sm"
    onClick={(e) => {
      console.log("[v0] Filter button clicked", { open: openFilters.priority })
      e.stopPropagation()
    }}
  >
    Priority
  </Button>
</PopoverTrigger>

// Check onOpenChange
<Popover
  open={openFilters.priority}
  onOpenChange={(open) => {
    console.log("[v0] Priority filter onOpenChange", { open })
    toggleFilter("priority", open)
  }}
>
\`\`\`

**Expected Console Output**:
\`\`\`
[v0] Filter button clicked {open: false}
[v0] Priority filter onOpenChange {open: true}
\`\`\`

**If Button Click Not Logging**: Issue with pointer-events or z-index
**If onOpenChange Not Logging**: Issue with Popover binding
**If Both Log But Popover Doesn't Open**: State management conflict

### Creating a New Category

**Input**: "Add a 'Networking' category with sub-categories"

**Output**:
\`\`\`typescript
// 1. Add to categories array
const cloudCategories = [
  // ... existing categories
  { id: "Networking", icon: Network, count: 2 },
]

// 2. Add sub-category mapping
const categorySubCategories: Record<string, string[]> = {
  // ... existing mappings
  Networking: ["Load Balancers", "VPN Gateways", "NAT Gateways", "Traffic Manager"],
}

// 3. Update data generation in lib/recommendations-data.ts
const categories = [
  // ... existing categories
  "Networking",
]

// 4. Configure savings ranges
const mediumValueCategories = new Set(["Networking"]) // or high/low value
\`\`\`

---

## 15. Glossary

- **ADR**: Architecture Decision Record - documented design decisions
- **CAB**: Change Advisory Board - approval process for changes
- **DEVUAT**: Development/User Acceptance Testing environment category
- **FinOps**: Financial Operations - cloud cost management practice
- **Popover**: UI component for displaying content in floating panel
- **Props drilling**: Passing props through multiple component layers
- **RLS**: Row Level Security (database security pattern, not used in this project)
- **RSC**: React Server Component (Next.js 16 feature)
- **SaaS**: Software as a Service
- **Seeded random**: Pseudo-random generator with consistent output
- **shadcn/ui**: Component library built on Radix UI primitives
- **Snooze**: Temporarily hide recommendation until future date
- **Sub-category**: Hierarchical classification under main category
- **WCAG**: Web Content Accessibility Guidelines
- **Zombie resources**: Idle or unused cloud resources costing money

---

## Citations

This documentation was compiled from:
- Chat: 2025-01-10, Initial project setup and structure
- Chat: 2025-01-10, Controlled Popover conflict debugging
- Chat: 2025-01-10, Tooltip color fix
- Chat: 2025-01-10, Filter button investigation
- Codebase: Components, lib files, and data structures as of v7

---

**Document Version**: 1.0  
**Last Updated**: January 10, 2025  
**Maintainer**: v0 AI Assistant
