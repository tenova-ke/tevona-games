"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LobbyPage() {
  const { code } = useParams(); // grab /wolf/[code]
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  // fetch room + players
  async function fetchLobby() {
    if (!code) return;

    const { data: roomData, error: roomErr } = await supabase
      .from("wolf_rooms")
      .select("*")
      .eq("code", code.toString())
      .single();

    if (roomErr || !roomData) {
      console.error(roomErr);
      router.push("/wolf/start");
      return;
    }

    setRoom(roomData);

    const { data: playerData, error: playerErr } = await supabase
      .from("wolf_players")
      .select("*")
      .eq("room_id", roomData.id);

    if (playerErr) console.error(playerErr);

    setPlayers(playerData || []);

    // check if current user is host
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id === roomData.host_id) {
      setIsHost(true);
    }

    setLoading(false);
  }

  // subscribe for real-time updates
  useEffect(() => {
    fetchLobby();

    const channel = supabase
      .channel(`lobby-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wolf_players" },
        (payload) => {
          fetchLobby();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  async function handleStartGame() {
    if (!room) return;

    const { error } = await supabase
      .from("wolf_rooms")
      .update({ status: "in_progress" })
      .eq("id", room.id);

    if (error) {
      console.error(error);
      return;
    }

    router.push(`/wolf/${code}/game`);
  }

  function copyInvite() {
    navigator.clipboard.writeText(
      `${window.location.origin}/wolf/join?code=${code}`
    );
    alert("Invite link copied!");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading lobby...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Lobby: {code}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Players</h2>
            <Button onClick={copyInvite}>Copy Invite Link</Button>
          </div>

          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="px-3 py-2 bg-gray-800 rounded flex justify-between"
              >
                <span>{p.name}</span>
                {p.id === room.host_id && (
                  <span className="text-yellow-400 text-sm">(Host)</span>
                )}
              </li>
            ))}
          </ul>

          {isHost && (
            <Button
              className="w-full"
              onClick={handleStartGame}
              disabled={players.length < 3}
            >
              {players.length < 3
                ? "Need at least 3 players"
                : "Start Game"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
