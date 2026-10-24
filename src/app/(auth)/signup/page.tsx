"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/foundations/ui/button/button";
import { Field } from "@/foundations/ui/field/field";
import { Input } from "@/foundations/ui/input/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-accent/10 via-background-secondary to-success/10 p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckIcon className="size-8" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Check your email</h2>
          <p className="mb-6 text-foreground-secondary">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link to activate your account.
          </p>
          <Link href="/login" className="font-medium text-accent">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-accent/10 via-background-secondary to-success/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Start tracking your household budget
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
            <Field>
              <Field.Label>Password</Field.Label>
              <Field.Control>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </Field.Control>
            </Field>
            <Field invalid={Boolean(error)}>
              <Field.Label>Confirm password</Field.Label>
              <Field.Control>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
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
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
