"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

    // ✅ Check if username is unique
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

    const { error, data } = await supabase.auth.signUp({
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
      // ✅ Redirect after signup
      router.push("/games");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h1>

        <input
          className="w-full p-2 border rounded mb-3"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          name="username"
          placeholder="Username (unique)"
          value={form.username}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />
          I agree to the Terms & Conditions
        </label>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
