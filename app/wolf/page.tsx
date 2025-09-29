"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WolfLobby() {
  const [players, setPlayers] = useState<string[]>(["You"]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !gameStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameStarted) {
      handleStart();
    }
  }, [timeLeft, gameStarted]);

  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied! Share with friends to join your game.");
  };

  const handleStart = () => {
    let finalPlayers = [...players];
    if (finalPlayers.length === 1) {
      finalPlayers.push("AI Wolf", "AI Villager");
    }
    setPlayers(finalPlayers);
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Werewolf Lobby</h1>

      {!gameStarted ? (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
          <p className="mb-4 text-center text-gray-300">
            Waiting for players... Game starts in{" "}
            <span className="font-bold text-yellow-400">{timeLeft}s</span>
          </p>

          <ul className="space-y-2 mb-4">
            {players.map((p, i) => (
              <li
                key={i}
                className="bg-gray-700 p-2 rounded-md text-center text-sm"
              >
                {p}
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              onClick={handleInvite}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
            >
              Invite Friends
            </button>
            <button
              onClick={handleStart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            >
              Start Now
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">Game Started!</h2>
          <ul className="space-y-2">
            {players.map((p, i) => (
              <li
                key={i}
                className="bg-gray-700 p-2 rounded-md text-center text-sm"
              >
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-400 text-sm">Gameplay coming next...</p>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/">← Back to Home</Link>
      </p>
    </div>
  );
}
