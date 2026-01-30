"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    email ? { email } : "skip"
  );

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/");
    } else {
      setEmail(storedEmail);
    }
    setIsLoading(false);
  }, [router]);

  return { email, currentUser, isLoading };
}
