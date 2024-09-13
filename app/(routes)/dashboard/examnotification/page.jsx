"use client";
import { useState } from "react";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import { toast, Toaster } from "react-hot-toast"; // Import toast and Toaster

export default function ExamNotificationForm() {
  const [institutionType, setInstitutionType] = useState("");
  const [formData, setFormData] = useState([
    {
      courseName: "",
      className: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  const handleInstitutionChange = (e) => {
    setInstitutionType(e.target.value);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!institutionType) {
      toast.error("Please select an institution type"); // Display error toast
      return;
    }

    try {
      // Create a new document in EXAM_NOTIFICATIONS with institutionType
      const institutionDocRef = await addDoc(
        collection(db, "EXAM_NOTIFICATIONS"),
        {
          institutionType,
        }
      );

      // Add exam notifications under the newly created document's NOTIFICATIONS sub-collection
      for (const notification of formData) {
        const notificationWithDates = {
          ...notification,
          startDate: new Date(notification.startDate),
          endDate: new Date(notification.endDate),
        };

        await addDoc(
          collection(
            db,
            `EXAM_NOTIFICATIONS/${institutionDocRef.id}/NOTIFICATIONS`
          ),
          notificationWithDates
        );
      }

      toast.success("Exam Notifications added successfully!"); // Display success toast

      // Reset form
      setFormData([
        {
          courseName: "",
          className: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ]);
      setInstitutionType("");
    } catch (error) {
      toast.error("Error adding exam notifications: " + error.message); // Display error toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster /> {/* React Hot Toast container */}
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Add Exam Notification
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Institution Type
            </label>
            <input
              type="text"
              value={institutionType}
              onChange={handleInstitutionChange}
              placeholder="Institution Type"
              className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.map((notification, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                Exam Notification {index + 1}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <input
                  type="text"
                  name="courseName"
                  value={notification.courseName}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Course Name"
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="className"
                  value={notification.className}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Class Name"
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="startDate"
                  value={notification.startDate}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Start Date"
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="endDate"
                  value={notification.endDate}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="End Date"
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <textarea
                name="description"
                value={notification.description}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Description"
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
                rows="4"
              />
            </div>
          ))}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-500 text-white rounded-md font-semibold shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
