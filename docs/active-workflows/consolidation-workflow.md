# Ticket System Consolidation Workflow

## 1. Current State Analysis

### Existing Fetch Functions
Currently, we have several overlapping fetch functions in `ticketStore.ts`:
- `fetchTickets(filters?: TicketFilters)` - General purpose ticket fetching
- `fetchAgentQueue()` - Fetches agent's assigned tickets
- `fetchAgentDashboardData()` - Fetches dashboard stats and recent tickets

### Issues Identified
1. Duplicate filtering logic
2. Inconsistent parameter handling
3. Redundant Supabase queries
4. Mixed concerns between data fetching and UI state

### Code Reduction Goals
- Remove duplicate filter implementations across components
- Eliminate redundant type definitions
- Consolidate color mapping and status definitions
- Remove duplicate query logic
- Target: Reduce related code by ~40% while improving type safety

## 2. Proposed Consolidation

### 2.1 Unified Fetch Function
```typescript
// In ticketStore.ts
interface TicketQueryOptions {
  role?: 'agent' | 'customer' | 'admin';
  view?: 'dashboard' | 'queue' | 'list';
  filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string | null;
    customer_id?: string;
    search?: string;
    timeframe?: 'today' | 'week' | 'month' | 'all';
  };
  sorting?: {
    field: 'created_at' | 'updated_at' | 'priority';
    order: 'asc' | 'desc';
  };
}

async function fetchTicketsUnified(options: TicketQueryOptions) {
  // Base query with role-based visibility
  let query = supabase.from('tickets').select('*')
  
  // Role-based filtering
  if (options.role === 'customer') {
    query = query.eq('customer_id', user.id)
  }
  
  // View-specific modifications
  if (options.view === 'dashboard') {
    query = query.limit(10)
  }
  
  // Apply common filters
  if (options.filters) {
    // Status filter
    if (options.filters.status) {
      query = query.eq('status', options.filters.status)
    }
    // ... other filters
  }
  
  // Apply sorting
  if (options.sorting) {
    query = query.order(options.sorting.field, { 
      ascending: options.sorting.order === 'asc' 
    })
  }
  
  return query
}
```

### 2.2 Specialized Functions
These functions will be thin wrappers around `fetchTicketsUnified` that handle specific use cases:

```typescript
// Dashboard-specific function
fetchAgentDashboard: async () => {
  const [ticketsData, statsData] = await Promise.all([
    // Recent tickets for quick access
    fetchTicketsUnified({
      role: 'agent',
      view: 'dashboard',
      sorting: { field: 'priority', order: 'desc' }
    }),
    // Agent performance stats
    supabase.rpc('get_agent_performance_stats')
  ]);

  return {
    tickets: ticketsData,
    stats: {
      assigned_tickets: statsData.assigned_tickets,
      resolved_today: statsData.resolved_today,
      average_response_time: statsData.average_response_time,
      satisfaction_rate: statsData.satisfaction_rate
    }
  };
},

// Customer-specific function
fetchCustomerTickets: async (filters?) => {
  // Handles customer's ticket list with their specific filters
  return fetchTicketsUnified({
    role: 'customer',
    view: 'list',
    filters: {
      ...filters,
      // Ensure customer can only see their tickets
      customer_id: user.id
    }
  });
}
```

### 2.3 Testing Checklist

#### Before Migration
1. Document Current Dashboard States:
   - Agent Dashboard:
     - [ ] Number of assigned tickets
     - [ ] Number of tickets resolved today
     - [ ] Average response time
     - [ ] Customer satisfaction rate
     - [ ] Recent high-priority tickets (limit 10)
   - Customer Dashboard:
     - [ ] Active tickets count
     - [ ] Recent activity (last 24h)
     - [ ] Average response time
     - [ ] Recent tickets list (last 5)

2. Document Filter Combinations:
   - Status Filters:
     - [ ] Open tickets
     - [ ] In-progress tickets
     - [ ] Pending tickets
     - [ ] Solved tickets
     - [ ] Closed tickets
   - Priority Filters:
     - [ ] Urgent tickets
     - [ ] High priority tickets
     - [ ] Medium priority tickets
     - [ ] Normal priority tickets
     - [ ] Low priority tickets
   - Combined Filters:
     - [ ] High priority + Open
     - [ ] Urgent + In Progress
     - [ ] Custom date ranges
     - [ ] Search + Status combinations

3. Performance Metrics:
   - [ ] Initial load time for dashboard
   - [ ] Filter application response time
   - [ ] Search response time
   - [ ] Real-time update latency

#### During Migration
1. Role-Based Access:
   - Agent Permissions:
     - [ ] View all tickets
     - [ ] View assigned tickets
     - [ ] Access performance metrics
     - [ ] Filter unassigned queue
   - Customer Permissions:
     - [ ] View own tickets only
     - [ ] Create new tickets
     - [ ] Update existing tickets
   - Admin Permissions:
     - [ ] View all tickets
     - [ ] Access all metrics
     - [ ] Manage user roles

2. Filter Functionality:
   - Search:
     - [ ] Subject search
     - [ ] Description search
     - [ ] Combined field search
   - Status Updates:
     - [ ] Status changes reflect immediately
     - [ ] Status history maintained
   - Priority Management:
     - [ ] Priority updates reflect in queues
     - [ ] Priority-based sorting works

3. Dashboard Metrics:
   - Agent Stats:
     - [ ] Ticket resolution rate
     - [ ] Response time tracking
     - [ ] Customer satisfaction scores
   - Queue Management:
     - [ ] Unassigned ticket count
     - [ ] Priority distribution
     - [ ] Age of tickets

#### After Migration
1. Performance Validation:
   - [ ] Query execution time
   - [ ] UI responsiveness
   - [ ] Real-time update performance
   - [ ] Memory usage

2. Functionality Verification:
   - [ ] All existing features work
   - [ ] No permission leaks
   - [ ] Error handling works
   - [ ] Edge cases handled

3. UI Components:
   - [ ] Ticket list renders correctly
   - [ ] Filters work as expected
   - [ ] Sort functions maintained
   - [ ] Real-time updates visible

## 3. Rollback Plan

1. Use Git for Safety
   - Create a dedicated branch for consolidation: `feat/ticket-system-consolidation`
   - Make atomic commits with clear messages for each change
   - Use pull request for review and easy reversion if needed

2. Testing Strategy
   - Run full test suite before merging
   - Deploy to staging environment first
   - Monitor error rates and performance metrics
   - Have clear acceptance criteria before proceeding

3. Emergency Rollback Process
   - If critical issues found:
     1. Identify the problematic commit(s) using git bisect if needed
     2. Create hotfix branch from last known good state
     3. Cherry-pick working changes if any
     4. Revert problematic changes
   - Document any issues found for future attempts

4. Monitoring Plan
   - Watch error rates in production
   - Monitor performance metrics
   - Track user-reported issues
   - Set up alerts for anomalies

## 4. Future Improvements

1. Add caching layer for frequently accessed data
2. Implement cursor-based pagination
3. Add real-time subscription management
4. Optimize query performance with indexes

## 5. Timeline

1. Day 1: Implementation of unified fetch function
2. Day 2: Store method updates and testing
3. Day 3: Component updates and integration
4. Day 4: Testing and performance optimization
5. Day 5: Documentation and cleanup

## 6. Success Metrics

1. Reduced code duplication (target: 40% reduction)
2. Improved type safety (zero any types)
3. Consistent error handling
4. Maintained or improved performance
5. No regression in functionality














=======================================

1) Create a New “fetchTicketsUnified” Function (ticketStore.ts)
• In ticketStore.ts, define an interface or type that captures possible fetch parameters (role, view, filter criteria, etc.).
• Build out a function that uses these parameters to build a single query to Supabase (or whichever backend you’re using).
• Include logic for conditions you previously handled in fetchTickets, fetchAgentQueue, and fetchAgentDashboardData (e.g., limiting results, ordering by priority).

// Step 1: Create a new unified fetch function
interface TicketQueryOptions {
  role?: 'agent' | 'customer' | 'admin';
  view?: 'dashboard' | 'queue' | 'list';
  filters?: {
    status?: string;  // or an enum
    priority?: string; // or an enum
  };
  limit?: number;
}

async function fetchTicketsUnified(options: TicketQueryOptions) {
  const { role, view, filters, limit = 10 } = options;

  // Start a base query
  let query = supabase
    .from('tickets')
    .select('id, subject, status, priority, created_at, updated_at');

  // Example: filter by role if needed
  if (role === 'agent') {
    // Possibly filter by assigned_to = current agent's ID, if you keep that logic here.
  }

  // Example: filter by status or priority if provided
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  // Limit or order results
  if (view === 'dashboard') {
    // Possibly sort by priority first, then date
    query = query.order('priority', { ascending: false });
  }
  
  // Common ordering
  query = query.order('created_at', { ascending: true }).limit(limit);

  // Execute query
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

2) Update “fetchTickets” to Use the New Function (ticketStore.ts)
• In the same file (ticketStore.ts), locate the old fetchTickets function.
• Replace its internal Supabase query logic with a simple call to fetchTicketsUnified, passing in the appropriate parameters for a general purpose fetch.
• Make sure the returned data is still set to your store state.
Example:

// Step 2: Migrate logic from fetchTickets to fetchTicketsUnified
const fetchTickets = async (filters?: { status?: string; priority?: string }) => {
  set({ loading: true, error: null });

  try {
    const result = await fetchTicketsUnified({
      filters,
      // This might be the default "list" view
      view: 'list',
      // You can add any default or custom logic here
      limit: 50,
    });

    set({ tickets: result, loading: false });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
  }
};

==========================

3) Update “fetchAgentQueue” to Use fetchTicketsUnified (ticketStore.ts)
• In ticketStore.ts, find fetchAgentQueue.
• Instead of directly querying Supabase, call fetchTicketsUnified with parameters that replicate agent queue logic (for instance, role = 'agent', maybe a filter for only “open” tickets, etc.).
• Remove the old direct query code.
Example:

// Step 3: Migrate fetchAgentQueue
const fetchAgentQueue = async () => {
  try {
    set({ loading: true, error: null });
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('No authenticated user found');

    const result = await fetchTicketsUnified({
      role: 'agent',
      view: 'queue',
      filters: { status: 'open' }, // Or whatever matches your queue logic
    });

    set({ agentQueue: result, loading: false });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
  }
};

================

4) Update “fetchAgentDashboardData” to Use fetchTicketsUnified (ticketStore.ts)
• Same file, locate fetchAgentDashboardData.
• Replace its Supabase query with a call to fetchTicketsUnified but set the view to “dashboard,” limit to 10, etc.
• Preserve any special logic (like merging in performance stats or other Supabase RPC calls).
Example:

// Step 4: Migrate fetchAgentDashboardData
const fetchAgentDashboardData = async () => {
  try {
    set({ loading: true, error: null });
    const { data: agentStats, error: statsError } = await supabase.rpc('get_agent_performance_stats');
    if (statsError) throw statsError;

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('No authenticated user found');

    const dashboardTickets = await fetchTicketsUnified({
      role: 'agent',
      view: 'dashboard',
      filters: {},  // specify if you want particular status or priority, or leave empty
      limit: 10,
    });

    set({
      agentStats,
      dashboardTickets,
      loading: false,
    });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
    throw err;
  }
};

==================

5) Clean Up & Remove Redundant Logic (ticketStore.ts)
• Review each of the original functions (fetchTickets, fetchAgentQueue, fetchAgentDashboardData). Confirm there’s no leftover query logic.
• Make sure each function is just calling fetchTicketsUnified with the correct parameters.
• Any old code or duplicative filters can be safely removed now.

==============================

6) Verify UI Pages & Components
• Now that all fetch calls reference fetchTicketsUnified indirectly, review your UI components (AgentDashboard.tsx, CustomerOverviewPage.tsx, etc.) to ensure they still function correctly.
• Most should work unchanged because they’re still calling the same store functions. But you might want to confirm each fetch gets the expected data.
• If you discover extra filters or sorting, add them to the fetchTicketsUnified call as options.

====================================

7) Optional: Extend fetchTicketsUnified for More Complex Use Cases
• If you need special conditions (like “only my assigned tickets” or “high priority only”), you can add or refine parameters in TicketQueryOptions.
• For instance, you could add an “assignedTo?: string” field for a user’s ID if you want direct filtering at the query level.





==========================================================

