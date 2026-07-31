"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROLES, type Role } from "@/lib/auth/types";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("parent");
  const [password, setPassword] = useState("parent123");
  const [role, setRole] = useState<Role>("parent");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Login failed");
        return;
      }
      router.replace(nextPath || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error while signing in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card flex w-full max-w-md flex-col gap-5"
    >
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="field"
          autoComplete="username"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Role</span>
        <select
          value={role}
          onChange={(event) => {
            const next = event.target.value as Role;
            setRole(next);
            if (next === "parent") {
              setUsername("parent");
              setPassword("parent123");
            } else {
              setUsername("child");
              setPassword("child123");
            }
          }}
          className="field"
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field"
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-fg-faint">
        Demo accounts: <code>parent</code> / <code>parent123</code> (parent) or{" "}
        <code>child</code> / <code>child123</code> (child).
      </p>
    </form>
  );
}
