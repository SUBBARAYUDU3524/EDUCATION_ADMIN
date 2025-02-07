"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners"; // Import ClipLoader for circular spinner
import useAuth from "../hooks/UseAuth";

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    // Show a spinner and custom background while loading
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-black">
        <ClipLoader size={80} color="#ffffff" />
        <p className="text-center mt-4 text-white text-lg">loading..</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
