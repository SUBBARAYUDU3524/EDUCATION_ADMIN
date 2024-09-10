"use client";
import React from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams

const Dashboardlayout = ({ children }) => {
  const searchParams = useSearchParams(); // Use useSearchParams to get query params

  // Get the collectionname from the URL's search params
  const collectionname = searchParams.get("collectionname");

  return (
    <div className="bg-black min-h-screen">
      <div className="fixed md:w-64 md-block bg-white text-black">
        <SideNav />
      </div>
      <div className="md:ml-64">
        <DashboardHeader />
        {React.cloneElement(children, { collectionname })}{" "}
        {/* Pass collectionname to children */}
      </div>
    </div>
  );
};

export default Dashboardlayout;
