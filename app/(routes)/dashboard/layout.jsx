"use client";
import React from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { ItemProvider } from "@/app/ItemContext";

const Dashboardlayout = ({ children }) => {
  return (
    <div className="bg-black min-h-screen">
      <div className="fixed md:w-64 md-block bg-white text-black">
        <SideNav />
      </div>
      <div className="md:ml-64">
        <DashboardHeader />
        <ItemProvider>{children} </ItemProvider>
        {/* Pass collectionname to children */}
      </div>
    </div>
  );
};

export default Dashboardlayout;
