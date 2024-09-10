"use client";
import React from "react";
import BarChart from "./_components/BarChart";
import PieChart from "./_components/PieChart";

const page = () => {
  return (
    <div className="flex flex-row  items-center justify-center pl-20 pt-20 gap-16">
      <div className="w-2/3  shadow-xl rounded-lg p-5">
        <h1 className="text-2xl font-bold mb-8 text-black text-center">
          Next.js Bar Chart Example
        </h1>
        <BarChart /> {/* Display the BarChart */}
      </div>
      <div className="w-2/3  shadow-xl rounded-lg p-5">
        <h1 className="text-2xl font-bold mb-8 text-black text-center">
          Pie Chart Example
        </h1>
        <PieChart /> {/* Display the BarChart */}
      </div>
    </div>
  );
};

export default page;
