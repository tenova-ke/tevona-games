"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { User, Mail, Lock, Calendar, UserCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    password: "",
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async () => {
    if (!form.terms) {
      setMessage("You must agree to the terms to continue.");
      return;
    }

    if (!form.username || !form.email || !form.password) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", form.username)
      .single();

    if (existing) {
      setMessage("That username is already taken.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          username: form.username,
          age: form.age,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/games");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        {/* Logo / Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Tevona Games
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            Create your account to start playing
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            icon={<UserCircle className="w-5 h-5 text-gray-400" />}
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            icon={<User className="w-5 h-5 text-gray-400" />}
            name="username"
            placeholder="Username (unique)"
            value={form.username}
            onChange={handleChange}
          />

          <Input
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            icon={<Calendar className="w-5 h-5 text-gray-400" />}
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
          />

          <Input
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-500 border-gray-300 rounded"
            />
            I agree to the Terms & Conditions
          </label>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 
                       text-white rounded-lg font-semibold shadow-md transition duration-200"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-red-300">{message}</p>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/80">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ✅ Reusable Input component with icons
function Input({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="flex items-center bg-white/20 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
      <div className="mr-3">{icon}</div>
      <input
        {...props}
        className="bg-transparent flex-1 outline-none text-white placeholder-gray-300"
      />
    </div>
  );
}
