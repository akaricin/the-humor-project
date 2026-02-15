import { createClient } from '../utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="ml-[50px] flex h-screen flex-col items-center justify-center bg-[#b1c5e7]">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Hello World</h1>
    </main>
  )
}