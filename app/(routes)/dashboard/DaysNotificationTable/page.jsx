"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import for Firebase Storage
import { db, storage } from "@/app/FirebaseConfig"; // Ensure you import storage from your Firebase config
import toast, { Toaster } from "react-hot-toast";

// JobNotifications Component
export default function JobNotifications() {
  const [jobNotifications, setJobNotifications] = useState([]);
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editData, setEditData] = useState({
    Day_Title: "",
    Date: "",
    Description: "",
    Event: "",
    Image_URL: "",
    newImage: null, // For storing the new selected image file
  });

  // Fetching job notifications from Firestore
  useEffect(() => {
    const fetchJobNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "DAYS_INFORMATION"));
        const jobs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobNotifications(jobs);
      } catch (error) {
        toast.error("Error fetching day specifications");
      }
    };
    fetchJobNotifications();
  }, []);

  // Format Firestore Timestamp to yyyy-mm-dd format
  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  // Edit Modal - Open with selected job notification
  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditData({
      Day_Title: job.Day_Title,
      Description: job.Description,
      Event: job.Event,
      Image_URL: job.Image_URL,
      Date: formatTimestamp(job.Date),
      newImage: null, // Reset the new image field
    });
    setEditModalVisible(true);
  };

  // Handle Edit Form Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image File Change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditData((prev) => ({ ...prev, newImage: e.target.files[0] }));
    }
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingOperation(true);

    try {
      const jobRef = doc(db, "DAYS_INFORMATION", selectedJob.id);
      let imageUrl = editData.Image_URL; // Default to the current image URL

      // Check if a new image was selected
      if (editData.newImage) {
        // Upload the new image to Firebase Storage
        const storageRef = ref(storage, `day_images/${editData.newImage.name}`);
        const uploadTask = await uploadBytesResumable(
          storageRef,
          editData.newImage
        );

        // Get the download URL of the uploaded image
        imageUrl = await getDownloadURL(uploadTask.ref);
      }

      // Update Firestore document with new data (including new image URL)
      await updateDoc(jobRef, {
        Day_Title: editData.Day_Title,
        Description: editData.Description,
        Event: editData.Event,
        Image_URL: imageUrl, // Update with the new image URL
        Date: new Date(editData.Date),
      });

      toast.success("Day Specification updated successfully");
      setEditModalVisible(false);
      setSelectedJob(null);

      // Refresh job notifications
      const querySnapshot = await getDocs(collection(db, "DAYS_INFORMATION"));
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobNotifications(jobs);
    } catch (error) {
      toast.error("Error updating day specification");
      console.log(error);
    }

    setLoadingOperation(false);
  };

  // Delete Modal - Open
  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteModalVisible(true);
  };

  // Confirm Deletion
  const handleDeleteConfirm = async () => {
    setLoadingOperation(true);
    try {
      await deleteDoc(doc(db, "DAYS_INFORMATION", selectedJob.id));
      toast.success("Day Specification deleted successfully");
      setDeleteModalVisible(false);
      setSelectedJob(null);

      // Refresh job notifications
      const querySnapshot = await getDocs(collection(db, "DAYS_INFORMATION"));
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobNotifications(jobs);
    } catch (error) {
      toast.error("Error deleting day specification");
    }
    setLoadingOperation(false);
  };

  return (
    <div className="p-8 ">
      <div className="border p-4 min-h-screen">
        <Toaster />
        <h2 className="text-2xl font-bold mb-6 text-center">
          Days Specification Table
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto text-black w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Day_Title</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Event</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobNotifications.map((job) => (
                <tr key={job.id}>
                  <td className="border px-4 py-2">{job.Day_Title}</td>
                  <td className="border px-4 py-2">
                    {formatTimestamp(job.Date)}
                  </td>
                  <td className="border px-4 py-2">{job.Description}</td>
                  <td className="border px-4 py-2">{job.Event}</td>
                  <td className="border px-4 py-2">
                    <a
                      href={job.Image_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={job.Image_URL}
                        alt="Job Image"
                        className="w-16 h-16 object-cover"
                      />
                    </a>
                  </td>

                  <td className="border px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Day Specification</h2>
              <form onSubmit={handleEditSubmit}>
                {/* Day Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Day Title
                  </label>
                  <input
                    type="text"
                    name="Day_Title"
                    value={editData.Day_Title}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="Date"
                    value={editData.Date}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={editData.Description}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Event */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Event
                  </label>
                  <input
                    type="text"
                    name="Event"
                    value={editData.Event}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditModalVisible(false)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {loadingOperation ? (
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span className="text-white">Updating</span>
                      </div>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this job notification?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setDeleteModalVisible(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  {loadingOperation ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
