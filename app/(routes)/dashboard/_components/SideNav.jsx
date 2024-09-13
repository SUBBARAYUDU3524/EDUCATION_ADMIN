import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/FirebaseConfig";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaEnvelope,
  FaSignOutAlt,
  FaStreetView,
  FaBars,
  FaTimes,
  FaGraduationCap,
  FaBookReader,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // To track which menu is open
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("Current logged in user:", user);
      } else {
        setCurrentUser(null);
      }
    });

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

  const toggleMenu = (menuId) => {
    setOpenMenu((prev) => (prev === menuId ? null : menuId)); // Only one menu remains open
  };

  const handleLinkClick = (path) => {
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
      icon: <FaTachometerAlt />,
    },
    {
      id: 2,
      name: "Reference Tables",
      icon: openMenu === 2 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 2.1,
          name: "SSC Table",
          path: "/dashboard/ssctable",
          icon: <FaBookReader />,
        },
        {
          id: 2.2,
          name: "Inter Table",
          path: "/dashboard/intertable",
          icon: <FaStreetView />,
        },
        {
          id: 2.3,
          name: "BTech Table",
          path: "/dashboard/btechtable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.4,
          name: "Degree Table",
          path: "/dashboard/degreetable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.5,
          name: "PG Table",
          path: "/dashboard/pgtable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.6,
          name: "Medical Table",
          path: "/dashboard/medicaltable",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 3,
      name: "Class Forms",
      icon: openMenu === 4 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 3.1,
          name: "SSC Form",
          path: "/dashboard/classSubForm",
          icon: <FaBookReader />,
        },
        {
          id: 3.2,
          name: "Inter Form",
          path: "/dashboard/interform",
          icon: <FaStreetView />,
        },
        {
          id: 3.3,
          name: "BTech Form",
          path: "/dashboard/btechform",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.4,
          name: "Degree Form",
          path: "/dashboard/degreeform",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.5,
          name: "PG Form",
          path: "/dashboard/pgform",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.6,
          name: "Medical Form",
          path: "/dashboard/medicalform",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 4,
      name: "Class Lists",
      icon: openMenu === 4 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 4.1,
          name: "SSC List",
          path: "/dashboard/ssclist",
          icon: <FaBookReader />,
        },
        {
          id: 4.2,
          name: "Inter List",
          path: "/dashboard/interlist",
          icon: <FaStreetView />,
        },
        {
          id: 4.3,
          name: "BTech List",
          path: "/dashboard/btechlist",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.4,
          name: "Degree List",
          path: "/dashboard/degreelist",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.5,
          name: "PG List",
          path: "/dashboard/pglist",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.6,
          name: "Medical List",
          path: "/dashboard/medicallist",
          icon: <FaGraduationCap />,
        },
      ],
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
            src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/385700/385739.jpg"
            alt="Logo"
            className="w-10 h-10"
          />
          <span className="text-sm font-bold">ERRTEKNALOZY</span>
        </div>

        {/* Navigation Menu */}
        <ul className="mt-4 pl-10 pr-10 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0 overflow-y-auto h-auto scrollbar-hide">
          {menuList.map((item) => (
            <li key={item.id} className="mb-4">
              <button
                onClick={() =>
                  item.children
                    ? toggleMenu(item.id)
                    : handleLinkClick(item.path)
                }
                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
                  path === item.path ? "bg-gray-700 font-bold" : ""
                } w-full text-left`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>

              {/* Submenu with transition */}
              {item.children && (
                <ul
                  className={`pl-4 mt-2 overflow-hidden transition-all duration-300 ${
                    openMenu === item.id
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <li key={child.id} className="mb-2">
                      <button
                        onClick={() => handleLinkClick(child.path)}
                        className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
                          path === child.path ? "bg-gray-700 font-bold" : ""
                        } w-full text-left`}
                      >
                        <span className="text-lg">{child.icon}</span>
                        <span>{child.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Profile Section Above Logout */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-600">
            <img
              src={currentUser?.photoURL || "https://via.placeholder.com/40"}
              alt="User Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="text-sm">
              <span>{currentUser?.displayName || "Guest User"}</span>
              <p className="text-xs text-gray-400">
                {currentUser?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded mt-2"
          >
            <FaSignOutAlt />
            <span className="pl-8">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
