"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TxResponse = {
  transaction?: any;
  error?: string;
};

export default function CoinsPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // UI state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [method, setMethod] = useState<"mpesa" | "paypal">("mpesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [paypalTx, setPaypalTx] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const REQUIRED_BUY_COINS = 100; // coins to add after successful verification
  const MPESA_NUMBER = "0758476795";
  const PAYPAL_EMAIL = "wangaelijah2006@gmail.com";
  const WHATSAPP = "https://wa.me/254758476795";

  // digits multiset baseline for password validation (21102006)
  const baselinePasswordSorted = "00011226"; // sorted digits of "21102006"

  useEffect(() => {
    // get session user and profile id (supabase client must be configured)
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user && mounted) {
        // try to fetch profile row (we store profile id identical to auth.user.id)
        setProfileId(user.id);
        await fetchBalance(user.id);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  async function fetchBalance(pid?: string) {
    try {
      setLoadingBalance(true);
      const id = pid ?? profileId;
      if (!id) return;
      const res = await fetch(`/api/coins/balance?profile_id=${id}`);
      const json = await res.json();
      // API returns { balance: { id, username, coins } }
      if (json?.balance?.coins !== undefined) {
        setBalance(json.balance.coins);
      } else if (json?.coins !== undefined) {
        setBalance(json.coins);
      } else {
        setBalance(null);
      }
    } catch (err) {
      console.error(err);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  }

  function validateMpesaCode(code: string) {
    // must be only UPPERCASE letters and numbers, containing at least 1 letter and 1 digit
    if (!code) return false;
    const ok = /^[A-Z0-9]+$/.test(code);
    const hasLetter = /[A-Z]/.test(code);
    const hasDigit = /[0-9]/.test(code);
    return ok && hasLetter && hasDigit;
  }

  function validatePasswordPattern(pw: string) {
    // must be exactly 8 digits and a permutation of "21102006" digits
    if (!/^\d{8}$/.test(pw)) return false;
    const sorted = pw.split("").sort().join("");
    return sorted === baselinePasswordSorted;
  }

  async function submitMpesa() {
    setMessage(null);
    if (!profileId) return setMessage("You must be logged in.");
    if (!buyerName || buyerName.trim().length < 2) {
      return setMessage("Please enter a valid buyer name.");
    }
    if (!validateMpesaCode(mpesaCode)) {
      return setMessage(
        "Invalid Mpesa code. Must be UPPERCASE letters and digits and include at least one letter and one digit."
      );
    }
    if (!validatePasswordPattern(password)) {
      return setMessage(
        "Invalid password. It must be 8 digits and contain the same digits as 21102006 (permutation)."
      );
    }

    // everything validated client-side — now send the transaction record (server should still verify externally)
    setSubmitting(true);
    try {
      const body = {
        profile_id: profileId,
        type: "buy",
        amount: REQUIRED_BUY_COINS,
        // we include metadata so admin can verify the purchase
        metadata: {
          method: "mpesa",
          mpesa_number: MPESA_NUMBER,
          mpesa_code: mpesaCode,
          buyer_name: buyerName,
          password_hint: "provided",
        },
      };

      const res = await fetch("/api/coins/transaction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: TxResponse = await res.json();
      if (json.error) {
        setMessage(json.error);
      } else {
        setMessage(
          `Recorded purchase request. Once verified, ${REQUIRED_BUY_COINS} coins will be added.`
        );
        // refresh balance (DB trigger adds coins once transaction is inserted and verified — if trigger already credits, it will show)
        await fetchBalance();
        // clear form
        setMpesaCode("");
        setBuyerName("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error while submitting. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPaypal() {
    setMessage(null);
    if (!profileId) return setMessage("You must be logged in.");
    if (!buyerName || buyerName.trim().length < 2) {
      return setMessage("Please enter a valid buyer name.");
    }
    if (!paypalTx || paypalTx.trim().length < 6) {
      return setMessage("Please enter your PayPal transaction ID or message.");
    }

    setSubmitting(true);
    try {
      const body = {
        profile_id: profileId,
        type: "buy",
        amount: REQUIRED_BUY_COINS,
        metadata: {
          method: "paypal",
          paypal_email: PAYPAL_EMAIL,
          paypal_tx: paypalTx,
          buyer_name: buyerName,
        },
      };

      const res = await fetch("/api/coins/transaction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: TxResponse = await res.json();
      if (json.error) {
        setMessage(json.error);
      } else {
        setMessage(`Recorded PayPal purchase request. Awaiting verification.`);
        await fetchBalance();
        setPaypalTx("");
        setBuyerName("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error while submitting. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header / Balance */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 1v22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Wallet</h1>
            <p className="text-sm text-gray-400">Coins & Transactions</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-right min-w-[220px]">
          <p className="text-xs text-gray-300">Balance</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-extrabold">
              {loadingBalance ? "..." : balance !== null ? balance : "--"}
            </p>
            <span className="text-sm text-gray-400">COINS</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Auto-updates after transactions</p>
        </div>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy / Send / History */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/6 shadow">
          <h2 className="text-lg font-semibold mb-3">Buy Coins</h2>
          <p className="text-sm text-gray-300 mb-4">
            Buy <strong>{REQUIRED_BUY_COINS} coins</strong> for your account. Choose Mpesa or PayPal and follow the steps.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => { setMethod("mpesa"); setShowBuyModal(true); }}
              className={`flex-1 py-3 rounded-lg font-medium ${method === "mpesa" ? "bg-amber-500 text-black" : "bg-white/6 text-white"}`}
            >
              Mpesa
            </button>
            <button
              onClick={() => { setMethod("paypal"); setShowBuyModal(true); }}
              className={`flex-1 py-3 rounded-lg font-medium ${method === "paypal" ? "bg-sky-500 text-white" : "bg-white/6 text-white"}`}
            >
              PayPal
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Contact</h3>
            <p className="text-xs text-gray-300">Mpesa: <strong>{MPESA_NUMBER}</strong></p>
            <p className="text-xs text-gray-300">PayPal: <strong>{PAYPAL_EMAIL}</strong></p>
            <p className="text-xs text-gray-300">
              WhatsApp: <a href={WHATSAPP} className="text-amber-300">message</a>
            </p>
          </div>
        </div>

        {/* Earn methods */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/6 shadow">
          <h2 className="text-lg font-semibold mb-3">Ways to Earn Coins</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>• Win 1v1 matches (winner takes wager).</li>
            <li>• Complete daily challenges (+20 coins per challenge).</li>
            <li>• Play solo mini-games (Number Guess, Trivia) to farm coins.</li>
            <li>• Invite friends — both get referral coins.</li>
            <li>• Special events & tournaments with coin prizes.</li>
          </ul>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
            <div className="flex gap-3">
              <button onClick={() => { /* TODO: navigate to games */ }} className="flex-1 py-3 rounded-lg bg-violet-600">Play Now</button>
              <button onClick={() => setShowBuyModal(true)} className="flex-1 py-3 rounded-lg bg-emerald-500">Buy Coins</button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history / actions */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/6 shadow">
        <h2 className="text-lg font-semibold mb-3">Quick Transactions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="py-3 px-4 rounded-lg bg-blue-600" onClick={() => setShowBuyModal(true)}>Buy</button>
          <button className="py-3 px-4 rounded-lg bg-indigo-600" onClick={() => alert("Send coins UI coming")}>Send</button>
          <button className="py-3 px-4 rounded-lg bg-rose-600" onClick={() => alert("Donate UI coming")}>Donate</button>
        </div>
      </div>

      {/* Modal - Buy */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Buy {REQUIRED_BUY_COINS} Coins</h3>
              <button onClick={() => { setShowBuyModal(false); setMessage(null); }} className="text-gray-400">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: form */}
              <div>
                <p className="text-sm text-gray-300 mb-3">Selected method: <span className="font-semibold">{method.toUpperCase()}</span></p>

                <label className="block text-xs text-gray-400 mb-1">Buyer Name</label>
                <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-3" placeholder="Full name used for payment" />

                {method === "mpesa" ? (
                  <>
                    <label className="block text-xs text-gray-400 mb-1">Mpesa Payment Code</label>
                    <input value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-3" placeholder="E.g. TD6ABC123" />

                    <label className="block text-xs text-gray-400 mb-1">Verification Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-3" placeholder="8-digit code (permutation of 21102006)" />

                    <p className="text-xs text-gray-500 mb-3">
                      Send <strong>{MPESA_NUMBER}</strong> the money; after payment paste the Mpesa code above (UPPERCASE letters + numbers). Then enter the verification password.
                    </p>

                    <div className="flex gap-3">
                      <button disabled={submitting} onClick={submitMpesa} className="flex-1 py-3 rounded bg-amber-500 text-black font-semibold">{submitting ? "Submitting..." : "Submit Mpesa"}</button>
                      <a className="flex-1 text-center py-3 rounded border border-white/10" href={WHATSAPP}>Contact</a>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs text-gray-400 mb-1">PayPal Transaction ID / Message</label>
                    <input value={paypalTx} onChange={(e) => setPaypalTx(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-3" placeholder="Paste PayPal transaction ID or message" />

                    <p className="text-xs text-gray-500 mb-3">
                      Send payment to <strong>{PAYPAL_EMAIL}</strong> then paste the PayPal transaction ID or message above. We'll verify and credit the coins.
                    </p>

                    <div className="flex gap-3">
                      <button disabled={submitting} onClick={submitPaypal} className="flex-1 py-3 rounded bg-sky-500 font-semibold">{submitting ? "Submitting..." : "Submit PayPal"}</button>
                      <a className="flex-1 text-center py-3 rounded border border-white/10" href={WHATSAPP}>Contact</a>
                    </div>
                  </>
                )}
                {message && <p className="mt-3 text-sm text-amber-300">{message}</p>}
              </div>

              {/* Right: info */}
              <div className="bg-white/4 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">How it works</h4>
                <ol className="text-xs text-gray-200 space-y-2">
                  <li>1. Choose payment method and send the money to the listed account.</li>
                  <li>2. Paste the payment reference (Mpesa code or PayPal tx id).</li>
                  <li>3. Provide buyer name and verification password (Mpesa only).</li>
                  <li>4. We verify the payment manually / via webhook and add {REQUIRED_BUY_COINS} coins to your account.</li>
                </ol>

                <div className="mt-4 text-xs text-gray-300">
                  <p><strong>Mpesa rules:</strong> code must be UPPERCASE letters & numbers and include at least one letter and one number. Password must be 8 digits and be a permutation of <code>21102006</code>.</p>
                  <p className="mt-2"><strong>PayPal:</strong> send to <code>{PAYPAL_EMAIL}</code>. Paste tx id here.</p>
                  <p className="mt-2">Need help? <a href={WHATSAPP} className="text-amber-300">WhatsApp</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
