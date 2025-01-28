# Active Flow: Consolidating Duplicate Fetch Functions

This guide walks through all details needed to unify multiple Supabase ticket-fetching functions into a single, flexible function called “fetchTicketsUnified.” Everything is here in one block for easy copy/paste. Below each step, you’ll see explanations on how Cursor can automate or handle incremental changes.

--------------------------------------------------------------------------------
## 1) Create or Update “fetchTicketsUnified” in ticketStore.ts
--------------------------------------------------------------------------------

In "src/stores/ticketStore.ts," define an interface or type that captures possible fetch parameters (role, view, filter criteria, etc.), and build a single unified query.

interface TicketQueryOptions {
  role?: 'agent' | 'customer' | 'admin';
  view?: 'dashboard' | 'queue' | 'list';
  filters?: {
    status?: string;   // or your TicketStatus enum
    priority?: string; // or your Priority enum
  };
  limit?: number;
}

/**
 * A single, unified function to fetch tickets with varying parameters
 */
export const fetchTicketsUnified = async (options: TicketQueryOptions) => {
  const { role, view, filters, limit = 10 } = options;
  // Start a base query
  let query = supabase
    .from('tickets')
    .select('id, subject, status, priority, created_at, updated_at');

  // Example role-based filtering
  if (role === 'agent') {
    // e.g., eq('assigned_to', currentUser.id) if needed
  } else if (role === 'customer') {
    // e.g., eq('customer_id', currentUser.id)
  } else if (role === 'admin') {
    // Possibly no filters, or your own admin logic
  }

  // Apply optional filters (status, priority)
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  // Handle the "view" parameter
  if (view === 'dashboard') {
    // e.g., order by priority descending for dashboard
    query = query.order('priority', { ascending: false });
  } else if (view === 'queue') {
    // e.g., eq('status', 'open') if you want only open tickets
  }

  // Common ordering or limiting
  query = query.order('created_at', { ascending: true }).limit(limit);

  // Execute query
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

Explanation of Key Points:
• role – differentiates agent, customer, admin queries.  
• filters – merges any status or priority filter logic in one place.  
• view – can define unique order or constraints (dashboard, queue, etc.).  
• limit – sets a default or user-defined record limit.

Cursor Explanation:
• You may want to define a new function in ticketStore.ts. Cursor can handle this by creating a new function after the existing imports.  
• Once done, Cursor can also generate small diffs, so you can easily insert these lines without manually copying them in multiple places.  

--------------------------------------------------------------------------------
## 2) Refactor Existing Functions in ticketStore.ts
--------------------------------------------------------------------------------

Replace direct Supabase query logic in “fetchTickets,” “fetchAgentQueue,” and “fetchAgentDashboardData” by calling fetchTicketsUnified.  
Doing this ensures any future modifications (like new columns or filters) only happen in one place.

--------------------------------------------------------------------------------
### 2A) fetchTickets
--------------------------------------------------------------------------------

Example code in ticketStore.ts:

export const fetchTickets = async (filters?: { status?: string; priority?: string }) => {
  set({ loading: true, error: null });
  try {
    const results = await fetchTicketsUnified({
      role: 'customer', // or omit if truly universal
      view: 'list',
      filters,
      limit: 50, // pick the limit or remove if unnecessary
    });
    set({ tickets: results, loading: false });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
  }
};

High-Level Changes:
• Instead of building a direct .from('tickets') query, simply call our new fetchTicketsUnified.  
• Pass in “filters” if you need them (like status or priority).

Cursor Explanation:
• You can use Cursor’s find and replace functionality or small diffs to replace the old query lines with a call to fetchTicketsUnified.  
• Step-by-step, remove your original .from('tickets') lines, then paste in the new function invocation.  

--------------------------------------------------------------------------------
### 2B) fetchAgentQueue
--------------------------------------------------------------------------------

If you previously had a specialized function for the agent’s queue:

export const fetchAgentQueue = async () => {
  set({ loading: true, error: null });
  try {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('No authenticated user found');

    const results = await fetchTicketsUnified({
      role: 'agent',
      view: 'queue',
      filters: { status: 'open' }, // e.g., all open tickets for the agent
      limit: 20,
    });

    set({ agentQueue: results, loading: false });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
  }
};

High-Level Changes:
• This now calls the unified function, specifying role: 'agent', plus queue logic and any standard filters you want.  
• Removes duplication with a direct “tickets” table query.

Cursor Explanation:
• In Cursor, navigate to where fetchAgentQueue is defined. Replace the direct supabase query with the call to fetchTicketsUnified.  
• You can let Cursor handle the new parameter definitions (like queue vs. dashboard) by copying them over from here.  

--------------------------------------------------------------------------------
### 2C) fetchAgentDashboardData
--------------------------------------------------------------------------------

If you have more advanced logic for an agent dashboard (e.g., showing performance stats plus recent tickets):

export const fetchAgentDashboardData = async () => {
  try {
    set({ loading: true, error: null });
    const { data: agentStats, error: statsError } = await supabase.rpc('get_agent_performance_stats');
    if (statsError) throw statsError;

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) throw new Error('No authenticated user found');

    // Now fetch tickets via the unified approach
    const dashboardTickets = await fetchTicketsUnified({
      role: 'agent',
      view: 'dashboard',
      filters: {}, // fill in if you want specific statuses or priorities
      limit: 10,
    });

    set({ agentStats, dashboardTickets, loading: false });
  } catch (err) {
    set({ error: (err as Error).message, loading: false });
    throw err;
  }
};

High-Level Changes:
• If you retrieve performance stats from an RPC, you can keep that logic.  
• For tickets, rely on fetchTicketsUnified.  
• “view: 'dashboard'” can provide different ordering or filter defaults.

Cursor Explanation:
• Cursor can help you maintain any existing code (e.g., agentStats) while only swapping out the direct table query for your new unified function.  
• If you need to keep the RPC call, simply ensure the modifications exclude that part.  

--------------------------------------------------------------------------------
## 3) Check & Update Your UI Pages
--------------------------------------------------------------------------------

Now that your store functions have been refactored, open these pages (or their equivalents) to confirm they call the updated store functions:

• src/pages/dashboards/AgentDashboard.tsx  
  – Typically calls fetchAgentDashboardData. No direct change needed if it was already referencing the store function. Just verify it still gets agentStats and dashboardTickets.

• src/pages/agent/AgentOverviewPage.tsx or src/pages/agent/AgentQueue.tsx  
  – Usually calls fetchAgentQueue. Again, no direct change unless it had a direct Supabase query. Verify it renders the correct tickets.

• src/pages/customer/CustomerOverviewPage.tsx  
  – Typically calls fetchTickets, possibly with filters. Ensure the UI remains consistent with the new store logic.

• src/pages/admin/AdminOverviewPage.tsx or AllTicketsPage.tsx  
  – If you have fetchAdminTickets or some variation, you can likewise refactor it to call fetchTicketsUnified (role: 'admin') for consistency.

In any UI file containing its own Supabase query, replace that logic with the appropriate store function. This ensures a single, consolidated approach to fetching tickets.

Cursor Explanation:
• Cursor can help you locate any direct supabase.from('tickets') references in your UI code, then replace them with calls to the store function (e.g., fetchTickets, fetchAgentQueue, etc.).  
• This step is typically straightforward: removing those direct calls keeps everything consistent in ticketStore.ts.  

--------------------------------------------------------------------------------
## 4) Clean Up & Test
--------------------------------------------------------------------------------

1. Remove or refactor any old specialized fetchers (e.g., fetchAllTickets) that duplicate logic.  
2. Thoroughly test each user role (agent, customer, admin) to confirm the correct data loads.  
3. Check any pagination, sorting, or real-time subscriptions if you rely on them.  
4. Confirm that removing or adjusting queries in one place (ticketStore.ts) properly updates all relevant pages.

Cursor Explanation:
• After finishing these steps, use Cursor to run your test or lint pipelines.  
• Perform a smoke test in each environment (agent, customer, admin) to verify everything is loading as expected.  

--------------------------------------------------------------------------------
## Summary
--------------------------------------------------------------------------------

By consolidating the ticket-fetching logic into fetchTicketsUnified, you eliminate redundancy and inconsistent queries. Every page or function that needs tickets now calls the same underlying logic, passing in only the parameters that differ by role or view. That’s the key to a more maintainable, unified codebase.

Cursor Explanation:
• This single-file approach with step-by-step instructions is easy for Cursor to parse. You can apply each change incrementally, confirm it works, and move on to the next.  
• Once done, you’ll have a simpler code structure and less risk of “forgotten” updates when your database or filter logic changes.