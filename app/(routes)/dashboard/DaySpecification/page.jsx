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
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

export default function DaySpecification() {
  const [jobNotifications, setJobNotifications] = useState([]);
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [noEvents, setNoEvents] = useState(false);

  // Fetch job notifications and match the current date
  useEffect(() => {
    const fetchJobNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "DAYS_INFORMATION"));
        const jobs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date();
        const formattedToday = format(today, "MM-dd"); // Format as MM-dd

        const matchingJobs = jobs.filter((job) => {
          const jobDate = format(job.Date.toDate(), "MM-dd"); // Format Firestore date as MM-dd
          return jobDate === formattedToday;
        });

        if (matchingJobs.length > 0) {
          setJobNotifications(matchingJobs);
          setNoEvents(false);
        } else {
          setNoEvents(true);
        }

        setCurrentDate(formattedToday);
      } catch (error) {
        toast.error("Error fetching day specifications");
      }
    };

    fetchJobNotifications();
  }, []);

  // Edit Modal
  const handleEdit = (job) => {
    setSelectedJob(job);
    // Implement edit functionality here...
  };

  return (
    <div className="container mx-auto p-6 text-center">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Day Specifications</h1>
        <p className="text-sm text-gray-500">
          Current Date: {currentDate.replace("-", "/")}
        </p>
      </div>

      {/* Check if there are no events */}
      {noEvents ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-xl font-semibold text-gray-600">
            No events scheduled for today.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobNotifications.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              {/* Image */}
              {job.Image_URL && (
                <a
                  href={job.Image_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={job.Image_URL}
                    alt={job.Day_Title}
                    className="w-full h-40 object-cover rounded-t-md mb-4"
                  />
                </a>
              )}

              {/* Title and Description */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {job.Day_Title}
              </h2>
              <p className="text-gray-600 mb-4">{job.Description}</p>

              {/* Event */}
              <div className="mb-4">
                <span className="inline-block bg-blue-500 text-white text-sm font-medium rounded-full px-3 py-1">
                  Event: {job.Event}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
