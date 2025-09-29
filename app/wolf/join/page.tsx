"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export default function JoinGamePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleJoin() {
    setMessage(null);

    if (!code.trim() || !name.trim()) {
      setMessage("Game code and name are required.");
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;

      if (!user) {
        setMessage("You must be signed in to join a game.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/wolf/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name,
          user_id: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to join room.");
        setLoading(false);
        return;
      }

      // Navigate to lobby page
      router.push(`/wolf/${code.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Game</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Enter the invite code shared by your friend and your display name to join the lobby.
          </p>

          <input
            type="text"
            placeholder="Game code (e.g., ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
          />

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
          />

          {message && <div className="text-sm text-red-400">{message}</div>}

          <Button onClick={handleJoin} disabled={loading} className="w-full">
            {loading ? "Joining..." : "Join Game"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
