"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage functions
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast"; // React Hot Toast
import { HashLoader } from "react-spinners"; // Spinner for loading effect
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Icons for show/hide password
import { auth, db, storage } from "../FirebaseConfig";
import Image from "next/image";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [username, setUsername] = useState(""); // New state for username
  const [photo, setPhoto] = useState(null); // New state for photo
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true); // Start loading
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Upload profile photo if selected
      let photoURL = "";
      if (photo) {
        const photoRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Update user profile
      await updateProfile(user, {
        displayName: username,
        photoURL,
      });

      // Save user details to Firestore
      await addDoc(collection(db, "users"), {
        email,
        phoneNumber,
        gender,
        username, // Save username
        photoURL, // Save photo URL
        uid: user.uid, // Save user ID
      });

      toast.success("Signup successful! Redirecting...");
      router.push("/");
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col  md:flex-row items-center justify-center bg-gray-100 h-screen">
      {/* Image Section for Small Screens */}
      <div className="block h-96 md:hidden w-full ">
        <Image
          src="https://img.freepik.com/free-vector/sign-concept-illustration_114360-125.jpg?ga=GA1.1.922153124.1719421359&semt=ais_hybrid"
          alt="Signup Illustration"
          layout="responsive"
          width={500}
          height={600}
          className="h-[90vh] w-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="flex w-full md:w-1/2 flex-col justify-center items-center p-6 bg-white md:h-screen md:p-12">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
            Sign Up
          </h2>
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  Female
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full p-2 border rounded text-black"
              />
            </div>

            <div className="mb-4 relative">
              <label className="block mb-1 font-semibold text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded text-black"
                required
              />
              <div
                className="absolute inset-y-0 right-3 top-8 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </div>
            </div>

            <div className="mb-4 relative">
              <label className="block mb-1 font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded text-black"
                required
              />
              <div
                className="absolute inset-y-0 right-3 top-8 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              disabled={loading} // Disable while loading
            >
              {loading ? (
                <div className="flex justify-center">
                  <HashLoader color="#fff" size={25} />
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">Already have an account?</p>
            <Link href="/" className="text-blue-500 hover:underline">
              Please Login
            </Link>
          </div>
        </div>
      </div>

      {/* Image Section for Medium+ Screens */}
      <div className="hidden md:block w-1/2 h-screen relative">
        <Image
          src="https://img.freepik.com/free-vector/sign-concept-illustration_114360-125.jpg?ga=GA1.1.922153124.1719421359&semt=ais_hybrid"
          alt="Signup Illustration"
          layout="fill"
          objectFit="cover"
          className="h-full w-full"
        />
      </div>

      {/* React Hot Toast container */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Signup;
