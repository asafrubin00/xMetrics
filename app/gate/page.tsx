"use client";

import { FormEvent, useState } from "react";

export default function GatePage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.get("password") }),
      });

      if (response.ok) {
        window.location.assign("/");
        return;
      }

      const body = await response.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "That password is not recognised.");
    } catch {
      setError("Access could not be checked. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <header className="text-center">
          <p className="font-display text-4xl text-cream-50">xMetrics</p>
          <p className="mt-2 text-xs tracking-wide text-gold-400">
            psychometrics, multiplied.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="mt-10 rounded-2xl border border-navy-700 bg-navy-900 p-6 sm:p-8"
        >
          <p className="font-display text-2xl text-cream-50">
            This prototype is private.
          </p>
          <label className="mt-6 block text-sm text-cream-300">
            Password
            <input
              required
              autoComplete="current-password"
              name="password"
              type="password"
              className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-3 text-cream-50 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-gold-400">
              {error}
            </p>
          )}
          <button
            disabled={submitting}
            type="submit"
            className="mt-5 w-full rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Checking access…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
