"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/foundations/ui/button/button";
import { Field } from "@/foundations/ui/field/field";
import { Input } from "@/foundations/ui/input/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-accent/10 via-background-secondary to-success/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">Budget Tracker</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Sign in to your household budget
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field invalid={Boolean(error)}>
              <Field.Label>Email address</Field.Label>
              <Field.Control>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field.Control>
            </Field>
            <Field invalid={Boolean(error)}>
              <Field.Label>Password</Field.Label>
              <Field.Control>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
              </Field.Control>
              {error ? <Field.Error>{error}</Field.Error> : null}
            </Field>
            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              size="lg"
            >
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Need an account?{" "}
            <Link href="/signup" className="font-medium text-accent">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
