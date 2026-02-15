'use client'

import { createClient } from '../utils/supabase/client'

export default function LogoutButton() {
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 w-full rounded-xl py-3 bg-red-600 hover:bg-red-700 text-white text-center transition-colors"
    >
      Sign Out
    </button>
  )
}
