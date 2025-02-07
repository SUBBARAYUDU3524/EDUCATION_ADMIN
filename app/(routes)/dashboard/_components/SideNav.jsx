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
      name: " TextBook Ref Tables",
      icon: openMenu === 2 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 2.1,
          name: "SSC Table",
          path: "/dashboard/SSCTables/TextBookTable",
          icon: <FaBookReader />,
        },
        {
          id: 2.2,
          name: "Inter Table",
          path: "/dashboard/IntermediateTables/TextBookTable",
          icon: <FaStreetView />,
        },
        {
          id: 2.3,
          name: "BTech Table",
          path: "/dashboard/BTechTables/BTechTextbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.4,
          name: "Degree Table",
          path: "/dashboard/DegreeTables/DegreeTextbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.5,
          name: "PG Table",
          path: "/dashboard/DegreeTables/PGTextbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 2.6,
          name: "Medical Table",
          path: "/dashboard/BTechTables/MedicalTextbookTable",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 3,
      name: "Textbook Forms",
      icon: openMenu === 3 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 3.1,
          name: "SSC Form",
          path: "/dashboard/SSCForms/SSCTextBookForm",
          icon: <FaBookReader />,
        },
        {
          id: 3.2,
          name: "Inter Form",
          path: "/dashboard/IntermediateForms/InterTextBookForm",
          icon: <FaStreetView />,
        },
        {
          id: 3.3,
          name: "BTech Form",
          path: "/dashboard/BTechForms/BTechTextbook",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.4,
          name: "Degree Form",
          path: "/dashboard/addToCollection/DEGREEFORM",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.5,
          name: "PG Form",
          path: "/dashboard/addToCollection/PGFORM",
          icon: <FaGraduationCap />,
        },
        {
          id: 3.6,
          name: "Medical Form",
          path: "/dashboard/BTechForms/MedicalTextbook",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 4,
      name: "Textbook Lists",
      icon: openMenu === 4 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 4.1,
          name: "SSC List",
          path: "/dashboard/SSCLists/SSCTextBookList",
          icon: <FaBookReader />,
        },
        {
          id: 4.2,
          name: "Inter List",
          path: "/dashboard/IntermediateLists/InterTextBookList",
          icon: <FaStreetView />,
        },
        {
          id: 4.3,
          name: "BTech List",
          path: "/dashboard/BtechLists/BtechTextBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.4,
          name: "Degree List",
          path: "/dashboard/DegreeLists/DegreeTextBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.5,
          name: "PG List",
          path: "/dashboard/DegreeLists/PGTextBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 4.6,
          name: "Medical List",
          path: "/dashboard/BtechLists/MedicalTextBookList",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 5,
      name: "Notification",
      icon: openMenu === 5 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 5.1,
          name: "Job Notification",
          path: "/dashboard/jobnotification",
          icon: <FaBookReader />,
        },
        {
          id: 5.2,
          name: "Exam Notification",
          path: "/dashboard/examnotification",
          icon: <FaStreetView />,
        },
        {
          id: 5.3,
          name: "Scholarship Notification",
          path: "/dashboard/SchlorShipNotificationForm",
          icon: <FaStreetView />,
        },
        {
          id: 5.4,
          name: "Days Notification",
          path: "/dashboard/DaysNotificationForm",
          icon: <FaStreetView />,
        },
      ],
    },
    {
      id: 6,
      name: "Notifications Tables",
      icon: openMenu === 6 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 6.1,
          name: "Job Notifications Table",
          path: "/dashboard/jobnotificationtable",
          icon: <FaBookReader />,
        },
        {
          id: 6.2,
          name: "Exam Notifications Table",
          path: "/dashboard/examnotificationtable",
          icon: <FaStreetView />,
        },
        {
          id: 6.3,
          name: "Scholarship Notifications Table",
          path: "/dashboard/schlarshipnotificationtable",
          icon: <FaStreetView />,
        },
        {
          id: 6.4,
          name: "Days Notifications Table",
          path: "/dashboard/DaysNotificationTable",
          icon: <FaStreetView />,
        },
      ],
    },
    {
      id: 7,
      name: "Workbook Forms",
      icon: openMenu === 7 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 7.1,
          name: "SSC Workbook",
          path: "/dashboard/SSCForms/SSCWorkBookForm",
          icon: <FaBookReader />,
        },
        {
          id: 7.2,
          name: "Inter Workbook",
          path: "/dashboard/IntermediateForms/InterWorkBookForm",
          icon: <FaStreetView />,
        },
        {
          id: 7.3,
          name: "BTech Workbook",
          path: "/dashboard/BTechForms/BTechWorkbook",
          icon: <FaGraduationCap />,
        },
        {
          id: 7.4,
          name: "Degree Workbook",
          path: "/dashboard/addToCollection/DegreeWorkBookForm",
          icon: <FaGraduationCap />,
        },
        {
          id: 7.5,
          name: "PG Workbook",
          path: "/dashboard/addToCollection/PGWorkBookForm",
          icon: <FaGraduationCap />,
        },
        {
          id: 7.6,
          name: "Medical Workbook",
          path: "/dashboard/BTechForms/MedicalWorkbook",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 8,
      name: "Workbook Lists",
      icon: openMenu === 8 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 8.1,
          name: "SSC Workbook List",
          path: "/dashboard/SSCLists/SSCTextBookList",
          icon: <FaBookReader />,
        },
        {
          id: 8.2,
          name: "Inter Workbook List",
          path: "/dashboard/IntermediateLists/InterWorkBookList",
          icon: <FaStreetView />,
        },
        {
          id: 8.3,
          name: "BTech Workbook List",
          path: "/dashboard/BtechLists/BtechWorkBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 8.4,
          name: "Degree Workbook List",
          path: "/dashboard/DegreeLists/DegreeWorkBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 8.5,
          name: "PG Workbook List",
          path: "/dashboard/DegreeLists/PGWorkBookList",
          icon: <FaGraduationCap />,
        },
        {
          id: 8.6,
          name: "Medical Workbook List",
          path: "/dashboard/BtechLists/MedicalWorkBookList",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 9,
      name: " Workbook Ref Tables",
      icon: openMenu === 9 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 9.1,
          name: "SSC Table",
          path: "/dashboard/SSCTables/WorkBookTable",
          icon: <FaBookReader />,
        },
        {
          id: 9.2,
          name: "Inter Table",
          path: "/dashboard/IntermediateTables/WorkBookTable",
          icon: <FaStreetView />,
        },
        {
          id: 9.3,
          name: "BTech Table",
          path: "/dashboard/BTechTables/BTechWorkbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 9.4,
          name: "Degree Table",
          path: "/dashboard/DegreeTables/DegreeWorkbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 9.5,
          name: "PG Table",
          path: "/dashboard/DegreeTables/PGWorkbookTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 9.6,
          name: "Medical Table",
          path: "/dashboard/BTechTables/MedicalWorkbookTable",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 10,
      name: "Previou Paper Forms",
      icon: openMenu === 10 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 10.1,
          name: "SSC Form ",
          path: "/dashboard/SSCPreviousPaperForms/SSCPreviousPaper",
          icon: <FaBookReader />,
        },
        {
          id: 10.2,
          name: "Intermediate Form",
          path: "/dashboard/InterPreviousPaperForms/InterPreviousPapers",
          icon: <FaStreetView />,
        },
        {
          id: 10.3,
          name: "BTech Form",
          path: "/dashboard/BTechPreviousPaperForms/BTechPaperForm",
          icon: <FaGraduationCap />,
        },
        {
          id: 10.4,
          name: "Degree Form",
          path: "/dashboard/DegreePreviousPaperForms/DegreePaperForm",
          icon: <FaGraduationCap />,
        },
        {
          id: 7.5,
          name: "PG Form",
          path: "/dashboard/DegreePreviousPaperForms/PGPaperForm",
          icon: <FaGraduationCap />,
        },
        {
          id: 10.6,
          name: "Medical Form",
          path: "/dashboard/BTechPreviousPaperForms/MedicalPaperForm",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 11,
      name: "Previous Papers Lists",
      icon: openMenu === 11 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 11.1,
          name: "SSC List",
          path: "/dashboard/SSCPreviousPapersList",
          icon: <FaBookReader />,
        },
        {
          id: 11.2,
          name: "Inter List",
          path: "/dashboard/InterPreviousPapersList",
          icon: <FaStreetView />,
        },
        {
          id: 11.3,
          name: "BTech List",
          path: "/dashboard/BTechPreviousPaperLists/BTechPapersList",
          icon: <FaGraduationCap />,
        },
        {
          id: 11.4,
          name: "Degree List",
          path: "/dashboard/DegreePreviousPaperLists/DegreePapersList",
          icon: <FaGraduationCap />,
        },
        {
          id: 11.5,
          name: "PG List",
          path: "/dashboard/DegreePreviousPaperLists/PGPapersList",
          icon: <FaGraduationCap />,
        },
        {
          id: 11.6,
          name: "Medical List",
          path: "/dashboard/BTechPreviousPaperLists/MedicalPapersList",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 12,
      name: " Previous Papers Tables",
      icon: openMenu === 12 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 12.1,
          name: "SSC Table",
          path: "/dashboard/SSCPrevPapersTable",
          icon: <FaBookReader />,
        },
        {
          id: 12.2,
          name: "Inter Table",
          path: "/dashboard/InterPrevPapersTable",
          icon: <FaStreetView />,
        },
        {
          id: 12.3,
          name: "BTech Table",
          path: "/dashboard/BTechPrevPaperTables/BTechTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 12.4,
          name: "Degree Table",
          path: "/dashboard/DegreePrevPapersTables/DegreeTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 12.5,
          name: "PG Table",
          path: "/dashboard/DegreePrevPapersTables/PGTable",
          icon: <FaGraduationCap />,
        },
        {
          id: 12.6,
          name: "Medical Table",
          path: "/dashboard/BTechPrevPaperTables/MedicalTable",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 13,
      name: "Competitive",
      icon: openMenu === 13 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 13.1,
          name: "Competitive Form",
          path: "/dashboard/CompetitiveForm",
          icon: <FaBookReader />,
        },
        {
          id: 13.2,
          name: "Competitive List",
          path: "/dashboard/CompetitiveList",
          icon: <FaStreetView />,
        },
        {
          id: 13.3,
          name: "Competitive Table",
          path: "/dashboard/CompetitiveTable",
          icon: <FaGraduationCap />,
        },
      ],
    },
    {
      id: 14,
      name: "DaysSpecification",
      icon: openMenu === 14 ? <FaChevronUp /> : <FaChevronDown />,
      children: [
        {
          id: 14.1,
          name: "Today Specification",
          path: "/dashboard/DaySpecification",
          icon: <FaBookReader />,
        },
        {
          id: 14.2,
          name: "Days Specification Form",
          path: "/dashboard/DaysNotificationForm",
          icon: <FaStreetView />,
        },
        {
          id: 13.3,
          name: "Days Specification Table",
          path: "/dashboard/DaysNotificationTable",
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
