"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/app/FirebaseConfig"; // Import both Firestore and Storage
import { toast, Toaster } from "react-hot-toast";

export default function DaysInformationForm() {
  const [formData, setFormData] = useState([
    {
      Day_Title: "",
      Date: "",
      Description: "",
      Event: "",
      Image_URL: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;
    setFormData(newFormData);
  };

  // Handle Image Upload
  const handleImageUpload = (index, e) => {
    const file = e.target.files[0]; // Get selected file
    if (file) {
      const storageRef = ref(storage, `day_images/${file.name}`); // Create a storage reference
      const uploadTask = uploadBytesResumable(storageRef, file); // Upload the file

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress tracking (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          toast.error("Image upload failed: " + error.message);
        },
        () => {
          // Get the download URL after successful upload
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const newFormData = [...formData];
            newFormData[index].Image_URL = downloadURL; // Update the formData with the image URL
            setFormData(newFormData); // Update the state
            toast.success("Image uploaded successfully!");
          });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true when submitting

    try {
      // Wait for image upload to finish before submitting the form
      for (const dayDetail of formData) {
        // Check if image URL is available before submitting the form
        if (!dayDetail.Image_URL) {
          toast.error("Please wait for the image upload to complete.");
          setIsLoading(false);
          return;
        }

        const dayDetailWithDate = {
          ...dayDetail,
          Date: new Date(dayDetail.Date), // Ensure Date is stored correctly
        };

        await addDoc(collection(db, "DAYS_INFORMATION"), dayDetailWithDate); // Add the document to Firestore
      }
      toast.success("Day details added successfully!");

      // Reset form fields after successful submission
      setFormData([
        {
          Day_Title: "",
          Date: "",
          Description: "",
          Event: "",
          Image_URL: "",
        },
      ]);
    } catch (error) {
      toast.error("Error adding day details: " + error.message);
    }
    setIsLoading(false); // Set loading state to false when done
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6">
      <Toaster /> {/* Toast container */}
      <div className="w-full max-w-3xl bg-black shadow-2xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Add Day Information
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {formData.map((dayDetail, index) => (
            <div key={index} className="p-6 bg-gray-100 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
                Day Information {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="date"
                  name="Date"
                  value={dayDetail.Date}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="Day_Title"
                  value={dayDetail.Day_Title}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Day Title"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <textarea
                  name="Description"
                  value={dayDetail.Description}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Description"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                  rows="3"
                />
                <input
                  type="text"
                  name="Event"
                  value={dayDetail.Event}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Event"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="file"
                  name="Image"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)} // Handle image upload
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
