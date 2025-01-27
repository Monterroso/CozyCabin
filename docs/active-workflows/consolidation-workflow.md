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
