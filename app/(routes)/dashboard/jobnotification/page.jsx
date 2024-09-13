"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import { toast, Toaster } from "react-hot-toast"; // Import toast and Toaster

export default function JobNotificationForm() {
  const [formData, setFormData] = useState([
    {
      Recruitment_Type: "",
      Name: "",
      Starting_Date: "",
      End_Date: "",
      Location: "",
      Qualification: "",
      Salary: "",
      Role: "",
      Official_Apply_Link: "",
    },
  ]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const job of formData) {
        const jobWithDates = {
          ...job,
          Starting_Date: new Date(job.Starting_Date),
          End_Date: new Date(job.End_Date),
        };

        await addDoc(collection(db, "JOB_NOTIFICATIONS"), jobWithDates);
      }
      toast.success("Job Notifications added successfully!");

      setFormData([
        {
          Recruitment_Type: "",
          Name: "",
          Starting_Date: "",
          End_Date: "",
          Location: "",
          Qualification: "",
          Salary: "",
          Role: "",
          Official_Apply_Link: "",
        },
      ]);
    } catch (error) {
      toast.error("Error adding job notifications: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6">
      <Toaster /> {/* Toast container */}
      <div className="w-full max-w-3xl bg-black shadow-2xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Add Job Notification
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {formData.map((job, index) => (
            <div key={index} className="p-6 bg-gray-100 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
                Job Notification {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="Recruitment_Type"
                  value={job.Recruitment_Type}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Recruitment Type"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                  style={{ placeholderTextColor: "black" }} // Black placeholder text
                />
                <input
                  type="text"
                  name="Name"
                  value={job.Name}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Job Name"
                  className="w-full  p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="Starting_Date"
                  value={job.Starting_Date}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="End_Date"
                  value={job.End_Date}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Location"
                  value={job.Location}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Location"
                  className="w-full  p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Qualification"
                  value={job.Qualification}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Qualification"
                  className="w-full p-3 border   border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Salary"
                  value={job.Salary}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Salary"
                  className="w-full p-3 border  border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Role"
                  value={job.Role}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Role"
                  className="w-full p-3  border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="url"
                  name="Official_Apply_Link"
                  value={job.Official_Apply_Link}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Official Apply Link"
                  className="w-full p-3 border   border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
