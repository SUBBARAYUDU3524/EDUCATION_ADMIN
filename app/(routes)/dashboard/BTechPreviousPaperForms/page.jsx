"use client";
import React, { useState, useEffect } from "react";
import { db, storage } from "@/app/FirebaseConfig";
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

const BTechForms = ({ collectionname }) => {
  const [year, setYear] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [unitImage, setUnitImage] = useState(null);
  const [unitPdf, setUnitPdf] = useState(null);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collectionname) {
      console.error("Error: collectionname is undefined or empty");
      return;
    }

    const yearRef = collection(db, collectionname);
    const unsubscribe = onSnapshot(yearRef, (snapshot) => {
      const yearList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setYears(yearList);
    });

    return () => unsubscribe();
  }, [collectionname]);

  useEffect(() => {
    if (selectedYear && collectionname) {
      const courseRef = collection(
        db,
        `${collectionname}/${selectedYear}/semesters`
      );
      const unsubscribe = onSnapshot(courseRef, (snapshot) => {
        const courseList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(courseList);
      });

      return () => unsubscribe();
    } else {
      setCourses([]);
    }
  }, [selectedYear, collectionname]);

  useEffect(() => {
    if (selectedCourse && selectedYear && collectionname) {
      const subjectRef = collection(
        db,
        `${collectionname}/${selectedYear}/semesters/${selectedCourse}/subjects`
      );
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
  }, [selectedCourse, selectedYear, collectionname]);

  const checkDuplicate = async (collectionPath, field, value) => {
    const q = query(collection(db, collectionPath), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleYearSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate(collectionname, "name", year);
      if (duplicate) {
        toast.error("Group already exists.");
        return;
      }

      const yearRef = collection(db, collectionname);
      await addDoc(yearRef, { name: year });
      toast.success("Group added successfully!");
      setYear("");
    } catch (e) {
      console.error("Error adding Group:", e);
      toast.error("Failed to add Group.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate(
        `${collectionname}/${selectedYear}/semesters`,
        "semesterName",
        semesterName
      );
      if (duplicate) {
        toast.error("Semester already exists.");
        return;
      }

      const courseRef = collection(
        db,
        `${collectionname}/${selectedYear}/semesters`
      );
      await addDoc(courseRef, { semesterName });
      toast.success("semester added successfully!");
      setSemesterName("");
    } catch (e) {
      console.error("Error adding semester:", e);
      toast.error("Failed to add semester.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duplicate = await checkDuplicate(
        `${collectionname}/${selectedYear}/semesters/${selectedCourse}/subjects`,
        "subjectName",
        subjectName
      );
      if (duplicate) {
        toast.error("Subject already exists.");
        return;
      }

      const subjectRef = collection(
        db,
        `${collectionname}/${selectedYear}/semesters/${selectedCourse}/subjects`
      );
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
      .pop()}`;
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
        `${collectionname}/${selectedYear}/semesters/${selectedCourse}/subjects/${selectedSubject}/units`,
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
        `${collectionname}/${selectedYear}/semesters/${selectedCourse}/subjects/${selectedSubject}/units`
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
    <div>
      <h1 className="text-3xl text-center mt-10 underline">
        {collectionname} FORM
      </h1>

      <div className="p-6 max-w-lg mx-auto mt-10 bg-black border rounded-lg shadow-md text-white">
        <Toaster position="top-right" />
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
            <ClipLoader color="#4A90E2" loading={loading} size={50} />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4">Add Group</h2>
        <form onSubmit={handleYearSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white">
              Group:
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="mt-1 block w-full text-lg text-black pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Group
          </button>
        </form>

        {/* Add Course */}
        <h2 className="text-2xl font-bold mb-4">Add Semester</h2>
        <form onSubmit={handleCourseSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white">
              Select Group:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" className="">
                  Select a Group
                </option>
                {years.map((yr) => (
                  <option key={yr.id} value={yr.id}>
                    {yr.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Semester Name:
              <input
                type="text"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                required
                className="mt-1 block w-full text-lg text-black pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Semester
          </button>
        </form>

        {/* Add Subject */}
        <h2 className="text-2xl font-bold mb-4">Add Subject</h2>
        <form onSubmit={handleSubjectSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white">
              Select Group:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a Group</option>
                {years.map((yr) => (
                  <option key={yr.id} value={yr.id}>
                    {yr.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Select Semester:
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a semester</option>
                {courses.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.semesterName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Subject Name:
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="mt-1 block w-full text-lg text-black pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Subject
          </button>
        </form>

        {/* Add Unit */}
        <h2 className="text-2xl font-bold mb-4">Add Previous Paper Year</h2>
        <form onSubmit={handleUnitSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white">
              Select Group:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Group</option>
                {years.map((yr) => (
                  <option key={yr.id} value={yr.id}>
                    {yr.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Select Semester:
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a Semester</option>
                {courses.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.semesterName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Select Subject:
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                className="mt-1 block text-black w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a subject</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.subjectName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Previous Paper Year:
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                required
                className="mt-1 block w-full text-lg text-black pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Previous Paper Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUnitImage(e.target.files[0])}
                className="mt-1 block w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Previous Paper PDF:
              <input
                type="file"
                onChange={(e) => setUnitPdf(e.target.files[0])}
                required
                accept="application/pdf"
                className="mt-1 block w-full text-lg pl-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 text-lg rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Previous Paper
          </button>
        </form>
      </div>
    </div>
  );
};

export default BTechForms;
