"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "./firebase/page";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast"; // React Hot Toast
import { HashLoader } from "react-spinners"; // Spinner for loading effect

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful! Redirecting..."); // Show success toast
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message); // Show error toast
      setLoading(false); // Stop loading on error
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 lg:h-screen">
      {/* Loading Spinner - Centers the loader in the middle of the screen */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <HashLoader color="blue" size={80} />
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white md:bg-transparent">
        {/* Image Section for Small Screens */}
        <div className="block md:hidden w-full">
          <img
            src="https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg?ga=GA1.1.922153124.1719421359&semt=ais_hybrid"
            alt="Login Illustration"
            className="h-80 w-full object-cover md:h-48"
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10 bg-white md:bg-white shadow-xl flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-700 text-center ">
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700 text-lg">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded text-black text-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700 text-lg">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded text-black text-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition text-lg"
              disabled={loading} // Disable button while loading
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">Don't have an account?</p>
            <Link href="/signup" className="text-blue-500 hover:underline">
              Please Sign Up
            </Link>
          </div>
        </div>

        {/* Image Section for Medium+ Screens */}
        <div className="hidden md:block w-1/2">
          <img
            src="https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg?ga=GA1.1.922153124.1719421359&semt=ais_hybrid"
            alt="Login Illustration"
            className="h-full w-full object-cover rounded-r-lg"
          />
        </div>
      </div>

      {/* React Hot Toast container */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Login;
