"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WolfLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image
          src="/IMG-20250929-WA0106.jpg"
          alt="Werewolf banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Welcome to Werewolf</h1>
            <p className="text-lg text-gray-300">
              Gather your friends. Find the werewolves. Survive the night.
            </p>
          </motion.div>
        </div>
      </div>

      {/* How to Play */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Make sure you’ve signed up before joining a lobby.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Join a game by entering the code or using an invite link.</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Start Game CTA */}
      <div className="text-center pb-16">
        <Link href="/wolf/start">
          <Button className="px-10 py-6 text-lg rounded-full bg-gradient-to-r from-red-600 to-red-800 shadow-xl hover:scale-105 transition-transform">
            Start Game
          </Button>
        </Link>
      </div>
    </div>
  );
      }
