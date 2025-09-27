"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/profile");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Name: {user.name || "N/A"}</h2>
              <p className="text-muted-foreground">Email: {user.email}</p>
            </div>
            <div className="space-y-2">
              <Link href="/avatar">
                <Button className="w-full">Edit Avatar</Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" className="w-full">View Catalog</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}