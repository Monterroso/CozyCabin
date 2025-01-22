import { supabase } from '../../lib/supabaseClient'

export function LogoutButton() {
  const handleLogout = async () => {
    // This will remove the session from local storage,
    // invalidating it in the browser.
    await supabase.auth.signOut()
    // You can then redirect or update local state as needed.
  }

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  )
} 