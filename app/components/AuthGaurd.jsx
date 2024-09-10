"use client";
import { useEffect } from "react";
import useAuth from "../hooks/UseAuth";
import { useRouter } from "next/navigation";

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    // You can show a loader or placeholder while checking authentication status
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthGuard;
