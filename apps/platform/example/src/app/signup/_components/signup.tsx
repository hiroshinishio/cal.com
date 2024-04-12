"use client";
import Link from "next/link";
import { signInWithCredentials } from "~/app/_actions";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useFormState } from "react-dom";
import { AddonFieldInput, AddonFieldPrefix } from "~/app/signup/_components/input";

export const SignupForm = () => {
  const [error, dispatch] = useFormState<{ error?: string | null }>(
    signInWithCredentials,
    { error: null },
  );

  return (
    <form action={dispatch}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <AddonFieldPrefix prefix="site.com/">
                <AddonFieldInput id="username" name="username" placeholder="john-doe" required />
              </AddonFieldPrefix>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>
            <input hidden name="redirectTo" value="/dashboard/getting-started" />
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="#" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
export default SignupForm;