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
      className="py-3 px-6 rounded-xl text-center w-full text-[30px] no-underline bg-gray-700 hover:bg-gray-700 transition-colors jersey-10-regular"
    >
      Sign Out
    </button>
  )
}
