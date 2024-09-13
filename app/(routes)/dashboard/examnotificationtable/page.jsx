"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import { toast, Toaster } from "react-hot-toast"; // For toast notifications

export default function ExamNotificationsTable() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState({
    className: "",
    courseName: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [loadingOperation, setLoadingOperation] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const examNotificationsSnapshot = await getDocs(
          collection(db, "EXAM_NOTIFICATIONS")
        );

        const allNotifications = [];

        for (const institutionDoc of examNotificationsSnapshot.docs) {
          const notificationsSnapshot = await getDocs(
            collection(
              db,
              `EXAM_NOTIFICATIONS/${institutionDoc.id}/NOTIFICATIONS`
            )
          );

          notificationsSnapshot.forEach((doc) => {
            allNotifications.push({
              id: doc.id,
              institutionId: institutionDoc.id,
              ...doc.data(),
            });
          });
        }

        setNotifications(allNotifications);
        setLoading(false);
        toast.success("Data fetched successfully!");
      } catch (error) {
        console.error("Error fetching exam notifications: ", error);
        toast.error("Error fetching exam notifications");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditData({
      className: item.className,
      courseName: item.courseName,
      startDate: formatTimestamp(item.startDate),
      endDate: formatTimestamp(item.endDate),
      description: item.description,
    });
    setEditModalVisible(true);
  };

  const handleDelete = (item) => {
    setCurrentItem(item);
    setDeleteModalVisible(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString().split("T")[0]; // Format as yyyy-mm-dd for input
    }
    return timestamp; // If already formatted or a string, return as is
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingOperation(true);
    try {
      const { id, institutionId } = currentItem;
      if (!institutionId || !id) {
        throw new Error("Invalid document ID or institution ID.");
      }
      const docRef = doc(
        db,
        `EXAM_NOTIFICATIONS/${institutionId}/NOTIFICATIONS`,
        id
      );
      await updateDoc(docRef, {
        ...editData,
        startDate: new Date(editData.startDate), // Convert string to Date object
        endDate: new Date(editData.endDate),
      });
      toast.success("Notification updated successfully!");
      setEditModalVisible(false);
      setLoadingOperation(false);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...editData } : item))
      );
    } catch (error) {
      console.error("Error updating notification: ", error);
      toast.error("Error updating notification");
      setLoadingOperation(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoadingOperation(true);
    try {
      const { id, institutionId } = currentItem;
      if (!institutionId || !id) {
        throw new Error("Invalid document ID or institution ID.");
      }
      const docRef = doc(
        db,
        `EXAM_NOTIFICATIONS/${institutionId}/NOTIFICATIONS`,
        id
      );
      await deleteDoc(docRef);
      toast.success("Notification deleted successfully!");
      setDeleteModalVisible(false);
      setLoadingOperation(false);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting notification: ", error);
      toast.error("Error deleting notification");
      setLoadingOperation(false);
    }
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center p-4 md:p-8">
      <Toaster />
      <div className="w-full max-w-6xl border p-4 md:p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Exam Notifications
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-black border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  Class Name
                </th>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  Course Name
                </th>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  Description
                </th>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  Start Date
                </th>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  End Date
                </th>
                <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 px-3 text-center text-gray-500"
                  >
                    No notifications available
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="py-2 px-3 border-b">
                      {notification.className}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {notification.courseName}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {notification.description}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {formatTimestamp(notification.startDate)}
                    </td>
                    <td className="py-2 px-3 border-b">
                      {formatTimestamp(notification.endDate)}
                    </td>

                    <td className="py-2 px-3 border-b">
                      <button
                        onClick={() => handleEdit(notification)}
                        className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(notification)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white text-black p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg md:text-xl font-bold mb-4">
                Edit Notification
              </h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Class Name
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={editData.className}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={editData.courseName}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editData.startDate}
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
                    name="endDate"
                    value={editData.endDate}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                  />
                </div>
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
                    {loadingOperation ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white text-black p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg md:text-xl font-bold mb-4">
                Confirm Deletion
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this notification?
              </p>
              <div className="flex justify-end space-x-2">
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
