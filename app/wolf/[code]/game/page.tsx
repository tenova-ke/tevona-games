"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function GamePage() {
  const { code } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("night"); // night/day
  const [role, setRole] = useState<string>("");

  async function fetchGame() {
    if (!code) return;

    // fetch room
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

    // fetch players
    const { data: playerData, error: playerErr } = await supabase
      .from("wolf_players")
      .select("*")
      .eq("room_id", roomData.id);

    if (playerErr) console.error(playerErr);
    setPlayers(playerData || []);

    // check current user
    const { data: userData } = await supabase.auth.getUser();
    const current = playerData?.find((p) => p.user_id === userData?.user?.id);
    setMe(current || null);
    setRole(current?.role || ""); // role will be set in DB
    setLoading(false);
  }

  useEffect(() => {
    fetchGame();

    const channel = supabase
      .channel(`game-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wolf_rooms" },
        (payload) => {
          fetchGame();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wolf_players" },
        (payload) => {
          fetchGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  async function assignRoles() {
    if (!room) return;

    // Only host assigns roles
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id !== room.host_id) return;

    // Shuffle players
    const shuffled = [...players].sort(() => 0.5 - Math.random());

    // Assign roles dynamically
    const assigned = shuffled.map((p, i) => {
      if (i === 0) return { ...p, role: "Werewolf" };
      if (i === 1) return { ...p, role: "Seer" };
      return { ...p, role: "Villager" };
    });

    for (let p of assigned) {
      await supabase
        .from("wolf_players")
        .update({ role: p.role })
        .eq("id", p.id);
    }
  }

  async function togglePhase() {
    if (!room) return;
    const newPhase = phase === "night" ? "day" : "night";

    await supabase
      .from("wolf_rooms")
      .update({ phase: newPhase })
      .eq("id", room.id);

    setPhase(newPhase);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading game...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Werewolf Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Phase:{" "}
            <span className="font-bold text-yellow-400 uppercase">
              {room?.phase || phase}
            </span>
          </p>

          {role ? (
            <div className="p-4 bg-gray-800 rounded-md">
              <p className="text-lg">
                Your role: <span className="font-bold">{role}</span>
              </p>
              {role === "Werewolf" && (
                <p className="text-red-400 text-sm">
                  Try to eliminate villagers secretly.
                </p>
              )}
              {role === "Seer" && (
                <p className="text-blue-400 text-sm">
                  Each night, you may reveal a player’s role.
                </p>
              )}
              {role === "Villager" && (
                <p className="text-green-400 text-sm">
                  Work with others to find the Werewolf.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm">Roles not assigned yet.</p>
          )}

          {me?.user_id === room?.host_id && (
            <div className="space-y-3">
              <Button className="w-full" onClick={assignRoles}>
                Assign Roles
              </Button>
              <Button className="w-full" onClick={togglePhase}>
                Switch to {phase === "night" ? "Day" : "Night"}
              </Button>
            </div>
          )}

          <div>
            <h2 className="font-semibold mb-2">Players</h2>
            <ul className="space-y-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="px-3 py-2 bg-gray-800 rounded flex justify-between"
                >
                  <span>{p.name}</span>
                  {room?.phase === "day" && (
                    <span className="text-gray-400 text-sm">
                      {p.role ? "???" : ""}
                    </span>
                  )}
                  {room?.phase === "night" && p.id === me?.id && (
                    <span className="text-gray-400 text-sm">
                      (That’s you)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
