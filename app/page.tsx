import { createClient } from '../utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="p-[15px] flex flex-1 flex-col items-center justify-center bg-[#b5c7eb]">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Hello World</h1>
    </div>
  )
}