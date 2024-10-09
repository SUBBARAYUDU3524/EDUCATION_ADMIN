"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import toast, { Toaster } from "react-hot-toast";

// JobNotifications Component
export default function JobNotifications() {
  const [jobNotifications, setJobNotifications] = useState([]);
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editData, setEditData] = useState({
    Scholarship_Name: "",
    Eligibility_Criteria: "",
    Starting_Date: "",
    End_Date: "",
    Scholarship_Amount: "",
    Documents_Required: "",
    Benefits: "",
    Official_Apply_Link: "",
    Contact_Information: "",
  });

  // Fetching job notifications from Firestore
  useEffect(() => {
    const fetchJobNotifications = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "SCHOLARSHIP_NOTIFICATIONS")
        );
        const jobs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobNotifications(jobs);
      } catch (error) {
        toast.error("Error fetching scholarship notifications");
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
      Scholarship_Name: job.Scholarship_Name,
      Eligibility_Criteria: job.Eligibility_Criteria,
      Benefits: job.Benefits,
      Contact_Information: job.Contact_Information,
      Documents_Required: job.Documents_Required,
      Scholarship_Amount: job.Scholarship_Amount,
      Official_Apply_Link: job.Official_Apply_Link,
      Starting_Date: formatTimestamp(job.Starting_Date),
      End_Date: formatTimestamp(job.End_Date),
    });
    setEditModalVisible(true);
  };

  // Handle Edit Form Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingOperation(true);
    try {
      const jobRef = doc(db, "SCHOLARSHIP_NOTIFICATIONS", selectedJob.id);
      await updateDoc(jobRef, {
        ...editData,
        Starting_Date: new Date(editData.Starting_Date),
        End_Date: new Date(editData.End_Date),
      });
      toast.success("Job notification updated successfully");
      setEditModalVisible(false);
      setSelectedJob(null);
      // Refresh job notifications
      const querySnapshot = await getDocs(
        collection(db, "SCHOLARSHIP_NOTIFICATIONS")
      );
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobNotifications(jobs);
    } catch (error) {
      toast.error("Error updating job notification");
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
      await deleteDoc(doc(db, "SCHOLARSHIP_NOTIFICATIONS", selectedJob.id));
      toast.success("Job notification deleted successfully");
      setDeleteModalVisible(false);
      setSelectedJob(null);
      // Refresh job notifications
      const querySnapshot = await getDocs(
        collection(db, "SCHOLARSHIP_NOTIFICATIONS")
      );
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobNotifications(jobs);
    } catch (error) {
      toast.error("Error deleting job notification");
    }
    setLoadingOperation(false);
  };

  return (
    <div className="p-8 ">
      <div className="border p-4 min-h-screen">
        <Toaster />
        <h2 className="text-2xl font-bold mb-6 text-center">
          Scholarship Notifications Table
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto text-black w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Scholarship_Name</th>
                <th className="px-4 py-2">Eligibility_Criteria</th>
                <th className="px-4 py-2">Documents_Required</th>
                <th className="px-4 py-2">Scholarship_Amount</th>
                <th className="px-4 py-2">Benefits</th>
                <th className="px-4 py-2">Start Date</th>
                <th className="px-4 py-2">End Date</th>
                <th className="px-4 py-2">Official_Apply_Link</th>
                <th className="px-4 py-2">Contact_Information</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobNotifications.map((job) => (
                <tr key={job.id}>
                  <td className="border px-4 py-2">{job.Scholarship_Name}</td>
                  <td className="border px-4 py-2">
                    {job.Eligibility_Criteria}
                  </td>
                  <td className="border px-4 py-2">{job.Documents_Required}</td>
                  <td className="border px-4 py-2">{job.Scholarship_Amount}</td>
                  <td className="border px-4 py-2">{job.Benefits}</td>

                  <td className="border px-4 py-2">
                    {formatTimestamp(job.Starting_Date)}
                  </td>
                  <td className="border px-4 py-2">
                    {formatTimestamp(job.End_Date)}
                  </td>

                  <td className="border px-4 py-2">
                    <a
                      href={job.Official_Apply_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {job.Official_Apply_Link}
                    </a>
                  </td>

                  <td className="border px-4 py-2">
                    {job.Contact_Information}
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
              <h2 className="text-xl font-bold mb-4">
                Edit Scholarship Notification
              </h2>
              <form onSubmit={handleEditSubmit}>
                {/* Scholarship Fields */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Scholarship Name
                  </label>
                  <input
                    type="text"
                    name="Scholarship_Name"
                    value={editData.Scholarship_Name}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    name="Eligibility_Criteria"
                    value={editData.Eligibility_Criteria}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Benefits
                  </label>
                  <input
                    type="text"
                    name="Benefits"
                    value={editData.Benefits}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="Contact_Information"
                    value={editData.Contact_Information}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Documents Required
                  </label>
                  <input
                    type="text"
                    name="Documents_Required"
                    value={editData.Documents_Required}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Scholarship Amount
                  </label>
                  <input
                    type="text"
                    name="Scholarship_Amount"
                    value={editData.Scholarship_Amount}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Existing Fields */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Official Apply Link
                  </label>
                  <input
                    type="text"
                    name="Official_Apply_Link"
                    value={editData.Official_Apply_Link}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Starting Date
                  </label>
                  <input
                    type="date"
                    name="Starting_Date"
                    value={editData.Starting_Date}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="End_Date"
                    value={editData.End_Date}
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
                    {loadingOperation ? "Saving..." : "Save"}
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
