"use client";

import { login } from "@/actions/auth";
import Link from "next/link";
import React, { useActionState } from "react";

const page = () => {
  const [state, action, isPending] = useActionState(login, undefined);
  return (
    <div className="container w-1/2">
      <h1 className="title">Login</h1>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input type="text" name="email" defaultValue={state?.email} />
          {state?.errors?.email && (
            <p className="error">{state.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" />
          {state?.errors?.password && (
            <div className="error">
              <p>Password must:</p>
              <ul className="list-disc list-inside ml-4">
                {state.errors.password.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-end gap-4">
          <button disabled={isPending} className="btn-primary">
            {isPending ? "Loading..." : "Login"}
          </button>

          <Link href="/register" className="text-link">
            or Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default page;
