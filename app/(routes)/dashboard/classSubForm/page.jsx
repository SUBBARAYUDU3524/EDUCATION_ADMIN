"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import { db, storage } from "@/app/firebase/page";

const ClassSubjectForm = () => {
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [unitImage, setUnitImage] = useState(null); // Update to handle file object
  const [unitPdf, setUnitPdf] = useState(null); // Update to handle file object
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const classRef = collection(db, "SSC");
    const unsubscribe = onSnapshot(classRef, (snapshot) => {
      const classList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const subjectRef = collection(db, `SSC/${selectedClass}/subjects`);
      const unsubscribe = onSnapshot(subjectRef, (snapshot) => {
        const subjectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjects(subjectList);
      });

      return () => unsubscribe();
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  const checkDuplicate = async (collectionPath, field, value) => {
    const q = query(collection(db, collectionPath), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // If there's at least one document, return true (indicating duplicate)
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate("SSC", "name", className);
      if (duplicate) {
        toast.error("Class already exists.");
        return;
      }

      const classRef = collection(db, "SSC");
      await addDoc(classRef, { name: className });
      toast.success("Class added successfully!");
      setClassName("");
    } catch (e) {
      console.error("Error adding class:", e);
      toast.error("Failed to add class.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate(
        `SSC/${selectedClass}/subjects`,
        "subjectName",
        subjectName
      );
      if (duplicate) {
        toast.error("Subject already exists.");
        return;
      }

      const subjectRef = collection(db, `SSC/${selectedClass}/subjects`);
      await addDoc(subjectRef, { subjectName });
      toast.success("Subject added successfully!");
      setSubjectName("");
    } catch (e) {
      console.error("Error adding subject:", e);
      toast.error("Failed to add subject.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, folder) => {
    const uniqueFileName = `${file.name.split(".")[0]}_${uuidv4()}.${file.name
      .split(".")
      .pop()}`; // Create a unique file name
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    return fileUrl;
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate(
        `SSC/${selectedClass}/subjects/${selectedSubject}/units`,
        "unitName",
        unitName
      );
      if (duplicate) {
        toast.error("Unit already exists.");
        return;
      }

      const unitImageUrl = await handleFileUpload(unitImage, "unitImages");
      const unitPdfLink = await handleFileUpload(unitPdf, "unitPdfs");

      const unitRef = collection(
        db,
        `SSC/${selectedClass}/subjects/${selectedSubject}/units`
      );
      await addDoc(unitRef, {
        unitNumber,
        unitImageUrl,
        unitPdfLink,
        unitName,
      });

      toast.success("Unit added successfully!");
      setUnitNumber("");
      setUnitImage(null);
      setUnitName("");
      setUnitPdf(null);
    } catch (e) {
      console.error("Error adding unit:", e);
      toast.error("Failed to add unit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto mt-10  bg-black border rounded-lg shadow-xl text-white">
      <Toaster position="top-right" />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <ClipLoader color="#4A90E2" loading={loading} size={50} />
        </div>
      )}
      <h2 className="text-3xl font-bold mb-4">Add Class</h2>
      <form onSubmit={handleClassSubmit} className="space-y-6 mb-8">
        <div>
          <label className="block text-lg font-medium text-white">
            Class Name:
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-6 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Class
        </button>
      </form>

      <h2 className="text-3xl font-bold mb-4">Add Subject</h2>
      <form onSubmit={handleSubjectSubmit} className="space-y-6 mb-8">
        <div>
          <label className="block text-lg font-medium text-white">
            Select Class:
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-white">
            Subject Name:
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-6 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Subject
        </button>
      </form>

      <h2 className="text-3xl font-bold mb-4">Add Unit</h2>
      <form onSubmit={handleUnitSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-white">
            Select Subject:
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            >
              <option value="">Select a subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-white">
            Unit Name:
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-white">
            Unit Number:
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              required
              className="mt-2 block w-full text-lg px-4 py-3 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-white">
            Unit Image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUnitImage(e.target.files[0])}
              className="mt-2 block w-full text-lg px-4 py-3 text-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-white ">
            Unit PDF:
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setUnitPdf(e.target.files[0])}
              className="mt-2 block w-full text-lg text-white px-4 py-3  border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-6 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Unit
        </button>
      </form>
    </div>
  );
};

export default ClassSubjectForm;
