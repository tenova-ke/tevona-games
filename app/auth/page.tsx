"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setMessage(error.message)
    else setMessage("Check your email for login link.")
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Sign in to Tevona Games</h2>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 rounded text-black mb-4"
      />
      <button
        onClick={handleLogin}
        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500"
      >
        Send Magic Link
      </button>
      {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
    </div>
  )
}
