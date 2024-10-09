"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import { toast, Toaster } from "react-hot-toast";

export default function ScholarshipNotificationForm() {
  const [formData, setFormData] = useState([
    {
      Scholarship_Name: "",
      Eligibility_Criteria: "",
      Starting_Date: "",
      End_Date: "",
      Scholarship_Amount: "",
      Documents_Required: "",
      Benefits: "",
      Official_Apply_Link: "",
      Contact_Information: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true when submitting
    try {
      for (const scholarship of formData) {
        const scholarshipWithDates = {
          ...scholarship,
          Starting_Date: new Date(scholarship.Starting_Date),
          End_Date: new Date(scholarship.End_Date),
        };

        await addDoc(
          collection(db, "SCHOLARSHIP_NOTIFICATIONS"),
          scholarshipWithDates
        );
      }
      toast.success("Scholarship Notifications added successfully!");

      setFormData([
        {
          Scholarship_Name: "",
          Eligibility_Criteria: "",
          Starting_Date: "",
          End_Date: "",
          Scholarship_Amount: "",
          Documents_Required: "",
          Benefits: "",
          Official_Apply_Link: "",
          Contact_Information: "",
        },
      ]);
    } catch (error) {
      toast.error("Error adding scholarship notifications: " + error.message);
    }
    setIsLoading(false); // Set loading state to false when done
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6">
      <Toaster /> {/* Toast container */}
      <div className="w-full max-w-3xl bg-black shadow-2xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Add Scholarship Notification
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {formData.map((scholarship, index) => (
            <div key={index} className="p-6 bg-gray-100 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
                Scholarship Notification {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="Scholarship_Name"
                  value={scholarship.Scholarship_Name}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Scholarship Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Eligibility_Criteria"
                  value={scholarship.Eligibility_Criteria}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Eligibility Criteria"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="Starting_Date"
                  value={scholarship.Starting_Date}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="End_Date"
                  value={scholarship.End_Date}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Scholarship_Amount"
                  value={scholarship.Scholarship_Amount}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Scholarship Amount"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Documents_Required"
                  value={scholarship.Documents_Required}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Documents Required"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Benefits"
                  value={scholarship.Benefits}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Benefits"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="url"
                  name="Official_Apply_Link"
                  value={scholarship.Official_Apply_Link}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Official Apply Link"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Contact_Information"
                  value={scholarship.Contact_Information}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Contact Information"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition duration-300"
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? "Submitting..." : "Submit"}{" "}
              {/* Change button text based on loading state */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
