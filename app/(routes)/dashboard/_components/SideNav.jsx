"use client";
import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/FirebaseConfig";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaInfoCircle,
  FaEnvelope,
  FaStreetView,
  FaBars,
  FaTimes,
  FaGraduationCap,
  FaBookReader,
} from "react-icons/fa"; // Importing icons

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State to store the current user
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the current user when logged in
        console.log("Current logged in user:", user); // Console the user object
      } else {
        setCurrentUser(null); // Clear the user if logged out
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLinkClick = (path) => {
    // Close side navigation on small screens
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }

    router.push(path);
  };

  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />, // Dashboard icon
    },
    {
      id: 2,
      name: "SSC list",
      path: "/dashboard/ssclist",
      icon: <FaBookReader />, // About icon
    },
    {
      id: 3,
      name: "InterForm",
      path: "/dashboard/interform",
      icon: <FaStreetView />, // Contact icon
    },
    {
      id: 4,
      name: "SSC FORM",
      path: "/dashboard/classSubForm",
      icon: <FaBookReader />,
    },
    {
      id: 5,
      name: "Inter List",
      path: "/dashboard/interlist",
      icon: <FaStreetView />,
    },
    {
      id: 6,
      name: "Degree Form",
      path: "/dashboard/degreeform",
      icon: <FaGraduationCap />,
    },
    {
      id: 7,
      name: "Degree List",
      path: "/dashboard/degreelist",
      icon: <FaGraduationCap />,
    },
    {
      id: 8,
      name: "PG Form",
      path: "/dashboard/pgform",
      icon: <FaEnvelope />,
    },
    {
      id: 9,
      name: "PG List",
      path: "/dashboard/pglist",
      icon: <FaEnvelope />,
    },
  ];

  return (
    <div>
      {/* Toggle Button for Small Screens */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl p-2 bg-gray-800 rounded-full shadow-md"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Side Navigation */}
      <div
        className={`fixed inset-0 top-0 left-0 bg-gray-800 text-white flex flex-col justify-between p-4 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-64 md:h-screen md:p-4 lg:p-6`}
      >
        {/* Logo and Company Name */}
        <div className="flex items-center gap-2 p-4 pt-14 pl-10 md:pt-4 md:pl-0 md:pr-0 lg:pl-6 lg:pr-6">
          <img
            src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/385700/385739.jpg" // Add your logo image here
            alt="Logo"
            className="w-10 h-10"
          />
          <span className="text-sm font-bold">ERRTEKNALOZY</span>
        </div>

        {/* Navigation Menu */}
        <ul className="mt-4 pl-10 pr-10 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0">
          {menuList.map((item) => (
            <li key={item.id} className="mb-4">
              <button
                onClick={() => handleLinkClick(item.path)}
                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
                  path === item.path ? "bg-gray-700 font-bold" : ""
                } w-full text-left`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Profile Section Above Logout */}
        <div className="mt-auto">
          <div className="flex items-center gap-4 p-4 border-t border-gray-700">
            <img
              src={currentUser?.photoURL || "/profile.jpg"} // Display user's profile picture or a default one
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-bold">{currentUser?.displayName || "Guest"}</p>
              <p className="text-sm text-gray-400">
                {currentUser?.email || "guest@example.com"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
