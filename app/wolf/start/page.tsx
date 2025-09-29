"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StartPage() {
  const { code } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRoom() {
    if (!code) return;

    // fetch room
    const { data: roomData, error: roomErr } = await supabase
      .from("wolf_rooms")
      .select("*")
      .eq("code", code.toString())
      .single();

    if (roomErr || !roomData) {
      console.error("Room not found:", roomErr);
      setLoading(false);
      return;
    }

    setRoom(roomData);

    // fetch players
    const { data: playerData, error: playerErr } = await supabase
      .from("wolf_players")
      .select("*")
      .eq("room_id", roomData.id);

    if (playerErr) {
      console.error("Players not found:", playerErr);
    }
    setPlayers(playerData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchRoom();

    const channel = supabase
      .channel(`lobby-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wolf_players" },
        () => {
          fetchRoom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading lobby...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Room not found. Please go back and create a new game.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Lobby – Code: {room.code}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="font-semibold">Players</h2>
          {players.length === 0 ? (
            <p className="text-gray-400">No players joined yet...</p>
          ) : (
            <ul className="space-y-2">
              {players.map((p) => (
                <li key={p.id} className="px-3 py-2 bg-gray-800 rounded">
                  {p.name}
                </li>
              ))}
            </ul>
          )}

          <Button
            className="w-full mt-4"
            onClick={() => router.push(`/wolf/${room.code}/game`)}
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
