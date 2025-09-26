"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Home() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase.from("profiles").select("*")
      if (!error && data) setUsers(data)
    }
    loadProfiles()
  }, [])

  return (
    <div>
      <h2 className="text-xl mb-4">Welcome to Tevona Games</h2>
      <p className="mb-4">This is the starting point. Supabase is connected ✅</p>

      <h3 className="font-semibold">Profiles in DB:</h3>
      <ul className="list-disc pl-6">
        {users.map((u) => (
          <li key={u.id}>{u.username || u.id}</li>
        ))}
      </ul>
    </div>
  )
}
