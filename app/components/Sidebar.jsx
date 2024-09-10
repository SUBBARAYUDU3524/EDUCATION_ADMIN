// components/Sidebar.js
import Link from "next/link";

const Sidebar = ({ children }) => {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white shadow-md text-black">
        <div className="flex flex-col p-4">
          <div className="text-xl font-bold mb-4">Menu</div>
          <div className="flex flex-col">
            <Link href="/home" passHref>
              <button className="py-2 px-4 mb-2 rounded transition-colors hover:bg-black hover:text-white">
                Home
              </button>
            </Link>
            <Link href="/about" passHref>
              <button className="py-2 px-4 mb-2 rounded transition-colors hover:bg-black hover:text-white">
                About
              </button>
            </Link>
            <Link href="/contact" passHref>
              <button className="py-2 px-4 mb-2 rounded transition-colors hover:bg-black hover:text-white">
                Contact
              </button>
            </Link>
          </div>
        </div>
      </div>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default Sidebar;
