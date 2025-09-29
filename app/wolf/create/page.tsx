"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export default function CreateGamePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate() {
    setMessage(null);
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;

      if (!user) {
        setMessage("You must be signed in to create a room. Please log in or sign up.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/wolf/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          max_players: maxPlayers,
          thumbnail_url: "/IMG-20250929-WA0106.jpg",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to create room");
        setLoading(false);
        return;
      }

      // API returns { room, player }
      const room = data.room;
      setGameCode(room.code);
      setRoomId(room.id);

      // auto-navigate to lobby page
      router.push(`/wolf/${room.code}`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a Werewolf Game</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Host a room and invite friends with a shareable code. If the lobby remains under-filled,
            AI players will fill seats automatically when the match starts.
          </p>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300 w-36">Max players</label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>

          {message && <div className="text-sm text-red-400">{message}</div>}

          <div className="flex gap-3">
            <Button onClick={handleCreate} className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Game"}
            </Button>

            <Link href="/wolf/join" className="inline-block">
              <Button variant="outline">Join a Game</Button>
            </Link>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              After creation you will be redirected to the lobby where you can copy the invite link and
              watch players join in real time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
