"use client";
import React, { useState, useEffect } from "react";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/app/FirebaseConfig"; // Adjust the import as needed
import { Toaster, toast } from "react-hot-toast";

const IntermediateList = () => {
  const [selectedIntermediate, setSelectedIntermediate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [intermediates, setIntermediates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loadingIntermediates, setLoadingIntermediates] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingsemester, setLoadingsemester] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState({ type: "", id: "", data: {} });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const collectionname = "PG";
  useEffect(() => {
    const fetchIntermediates = async () => {
      setLoadingIntermediates(true);
      try {
        const snapshot = await getDocs(collection(db, collectionname));
        setIntermediates(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching intermediates:", error);
      } finally {
        setLoadingIntermediates(false);
      }
    };
    fetchIntermediates();
  }, []);

  useEffect(() => {
    if (selectedIntermediate) {
      const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
          const snapshot = await getDocs(
            collection(db, `${collectionname}/${selectedIntermediate}/courses`)
          );
          setCourses(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [selectedIntermediate]);

  useEffect(() => {
    if (selectedCourse) {
      const fetchSemesters = async () => {
        setLoadingsemester(true);
        try {
          const snapshot = await getDocs(
            collection(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters`
            )
          );
          setSemesters(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (error) {
          console.error("Error fetching semester:", error);
        } finally {
          setLoadingsemester(false);
        }
      };
      fetchSemesters();
    }
  }, [selectedCourse]);
  useEffect(() => {
    if (selectedSemester) {
      const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
          const snapshot = await getDocs(
            collection(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${selectedSemester}/subjects`
            )
          );
          setSubjects(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (error) {
          console.error("Error fetching subjects:", error);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      const fetchUnits = async () => {
        setLoadingUnits(true);
        try {
          const snapshot = await getDocs(
            collection(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${selectedSemester}/subjects/${selectedSubject}/units`
            )
          );
          setUnits(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching units:", error);
        } finally {
          setLoadingUnits(false);
        }
      };
      fetchUnits();
    }
  }, [selectedSubject]);
  console.log(units);
  // Function to delete a course and all its subjects
  const handleDeleteCourse = async (courseId) => {
    try {
      const courseRef = doc(
        db,
        `${collectionname}/${selectedIntermediate}/courses/${courseId}`
      );

      // Fetch all semesters under the course
      const semesterSnapshot = await getDocs(
        collection(courseRef, "semesters")
      );
      for (const semesterDoc of semesterSnapshot.docs) {
        const semesterId = semesterDoc.id;

        // Fetch all subjects under the semester
        const subjectSnapshot = await getDocs(
          collection(semesterDoc.ref, "subjects")
        );
        for (const subjectDoc of subjectSnapshot.docs) {
          const subjectId = subjectDoc.id;

          // Fetch all units under each subject
          const unitSnapshot = await getDocs(
            collection(subjectDoc.ref, "units")
          );
          for (const unitDoc of unitSnapshot.docs) {
            const unitData = unitDoc.data();

            // Delete associated files from storage
            if (unitData.unitImageUrl) {
              const imageRef = ref(storage, unitData.unitImageUrl);
              await deleteObject(imageRef);
            }
            if (unitData.unitPdfLink) {
              const pdfRef = ref(storage, unitData.unitPdfLink);
              await deleteObject(pdfRef);
            }

            // Delete each unit document
            await deleteDoc(unitDoc.ref);
          }

          // Delete the subject document after all units are deleted
          await deleteDoc(subjectDoc.ref);
        }

        // Delete the semester document after all subjects are deleted
        await deleteDoc(semesterDoc.ref);
      }

      // Delete the course document after all semesters are deleted
      await deleteDoc(courseRef);

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );

      toast.success(
        "Course and all its semesters, subjects, and units deleted successfully!"
      );
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course.");
    }
  };

  // Function to delete a subject and all its units
  const handleDeleteSemester = async (semesterId) => {
    try {
      const semesterRef = doc(
        db,
        `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${semesterId}`
      );

      // Fetch all subjects under the semester
      const subjectSnapshot = await getDocs(
        collection(semesterRef, "subjects")
      );
      for (const subjectDoc of subjectSnapshot.docs) {
        const subjectId = subjectDoc.id;

        // Fetch all units under each subject
        const unitSnapshot = await getDocs(collection(subjectDoc.ref, "units"));
        for (const unitDoc of unitSnapshot.docs) {
          const unitData = unitDoc.data();

          // Delete associated files from storage
          if (unitData.unitImageUrl) {
            const imageRef = ref(storage, unitData.unitImageUrl);
            await deleteObject(imageRef);
          }
          if (unitData.unitPdfLink) {
            const pdfRef = ref(storage, unitData.unitPdfLink);
            await deleteObject(pdfRef);
          }

          // Delete each unit document
          await deleteDoc(unitDoc.ref);
        }

        // Delete the subject document after all units are deleted
        await deleteDoc(subjectDoc.ref);
      }

      // Delete the semester document after all subjects are deleted
      await deleteDoc(semesterRef);

      setSemesters((prevSemesters) =>
        prevSemesters.filter((semester) => semester.id !== semesterId)
      );

      toast.success(
        "Semester and all its subjects and units deleted successfully!"
      );
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast.error("Failed to delete semester.");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const subjectRef = doc(
        db,
        `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${selectedSemester}/subjects/${subjectId}`
      );

      // Fetch all units under the subject
      const unitSnapshot = await getDocs(collection(subjectRef, "units"));
      for (const unitDoc of unitSnapshot.docs) {
        const unitData = unitDoc.data();

        // Delete associated files from storage
        if (unitData.unitImageUrl) {
          const imageRef = ref(storage, unitData.unitImageUrl);
          await deleteObject(imageRef);
        }
        if (unitData.unitPdfLink) {
          const pdfRef = ref(storage, unitData.unitPdfLink);
          await deleteObject(pdfRef);
        }

        // Delete each unit document
        await deleteDoc(unitDoc.ref);
      }

      // Delete the subject document after all units are deleted
      await deleteDoc(subjectRef);

      setSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== subjectId)
      );

      toast.success("Subject and all its units deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject.");
    }
  };

  // Similar function to delete an intermediate and its courses
  const handleDeleteIntermediate = async (intermediateId) => {
    try {
      const intermediateRef = doc(db, collectionname, intermediateId);

      // Fetch all courses under the intermediate
      const courseSnapshot = await getDocs(
        collection(intermediateRef, "courses")
      );
      for (const courseDoc of courseSnapshot.docs) {
        const courseId = courseDoc.id;

        // Fetch all semesters under each course
        const semesterSnapshot = await getDocs(
          collection(courseDoc.ref, "semesters")
        );
        for (const semesterDoc of semesterSnapshot.docs) {
          const semesterId = semesterDoc.id;

          // Fetch all subjects under each semester
          const subjectSnapshot = await getDocs(
            collection(semesterDoc.ref, "subjects")
          );
          for (const subjectDoc of subjectSnapshot.docs) {
            const subjectId = subjectDoc.id;

            // Fetch all units under each subject
            const unitSnapshot = await getDocs(
              collection(subjectDoc.ref, "units")
            );
            for (const unitDoc of unitSnapshot.docs) {
              const unitData = unitDoc.data();

              // Delete associated files from storage (image and PDF)
              if (unitData.unitImageUrl) {
                const imageRef = ref(storage, unitData.unitImageUrl);
                await deleteObject(imageRef);
              }
              if (unitData.unitPdfLink) {
                const pdfRef = ref(storage, unitData.unitPdfLink);
                await deleteObject(pdfRef);
              }

              // Delete each unit document
              await deleteDoc(unitDoc.ref);
            }

            // Delete the subject document after all units are deleted
            await deleteDoc(subjectDoc.ref);
          }

          // Delete the semester document after all subjects are deleted
          await deleteDoc(semesterDoc.ref);
        }

        // Delete the course document after all semesters are deleted
        await deleteDoc(courseDoc.ref);
      }

      // Finally, delete the intermediate document
      await deleteDoc(intermediateRef);

      setIntermediates((prevIntermediates) =>
        prevIntermediates.filter(
          (intermediate) => intermediate.id !== intermediateId
        )
      );

      toast.success(
        "PG and all its courses, semesters, subjects, and units deleted successfully!"
      );
    } catch (error) {
      console.error("Error deleting PG:", error);
      toast.error("Failed to delete PG.");
    }
  };

  const handleDeleteUnit = async (unitId) => {
    try {
      const unitRef = doc(
        db,
        `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}semesters/${selectedSemester}/subjects/${selectedSubject}/units`,
        unitId
      );
      const unitDoc = await getDoc(unitRef);
      const unitData = unitDoc.data();

      if (unitData.unitImageUrl) {
        const imageRef = ref(storage, unitData.unitImageUrl);
        await deleteObject(imageRef);
      }
      if (unitData.unitPdfLink) {
        const pdfRef = ref(storage, unitData.unitPdfLink);
        await deleteObject(pdfRef);
      }

      await deleteDoc(unitRef);
      toast.success("Unit deleted successfully!");
      setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId));
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit.");
    }
  };

  const handleEditClick = (type, id, data) => {
    setEditing({ type, id, data });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setLoadingEdit(true);
      const { type, id, data } = editing;
      switch (type) {
        case "PG":
          await updateDoc(doc(db, collectionname, id), data);
          setIntermediates(
            intermediates.map((intermediate) =>
              intermediate.id === id
                ? { ...intermediate, ...data }
                : intermediate
            )
          );
          break;
        case "COURSES":
          await updateDoc(
            doc(db, `${collectionname}/${selectedIntermediate}/courses`, id),
            data
          );
          setCourses(
            courses.map((course) =>
              course.id === id ? { ...course, ...data } : course
            )
          );
          break;
        case "SEMESTERS":
          await updateDoc(
            doc(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters`,
              id
            ),
            data
          );
          setSemesters(
            semesters.map((course) =>
              course.id === id ? { ...course, ...data } : course
            )
          );
          break;
        case "SUBJECTS":
          await updateDoc(
            doc(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${selectedSemester}/subjects`,
              id
            ),
            data
          );
          setSubjects(
            subjects.map((subject) =>
              subject.id === id ? { ...subject, ...data } : subject
            )
          );
          break;
        case "UNITS":
          await updateDoc(
            doc(
              db,
              `${collectionname}/${selectedIntermediate}/courses/${selectedCourse}/semesters/${selectedSemester}/subjects/${selectedSubject}/units`,
              id
            ),
            data
          );
          setUnits(
            units.map((unit) => (unit.id === id ? { ...unit, ...data } : unit))
          );
          break;
        default:
          throw new Error("Invalid type for update.");
      }
      toast.success("Update successful!");
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update.");
    } finally {
      setLoadingEdit(false);
      setShowEditModal(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing({ type: "", id: "", data: {} });
    setShowEditModal(false);
  };

  return (
    <div>
      <h1 className="text-3xl text-center mt-10 underline">PG LIST</h1>

      <div className="p-4">
        <Toaster />
        <h1 className="text-2xl font-bold mb-4">
          Class, Subject, and Unit Management
        </h1>
        <div className="space-y-4">
          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">
              Select PG:
              <select
                value={selectedIntermediate}
                onChange={(e) => setSelectedIntermediate(e.target.value)}
                className="ml-2 p-2 border text-black border-gray-300 rounded"
              >
                <option value="">Select PG</option>

                {loadingIntermediates ? (
                  <option>Loading...</option>
                ) : (
                  intermediates.map((intermediate) => (
                    <option key={intermediate.id} value={intermediate.id}>
                      {intermediate.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            {selectedIntermediate && (
              <label className="font-semibold mb-2">
                Select Course:
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="ml-2 p-2 border text-black border-gray-300 rounded"
                >
                  <option value="">Select Course</option>
                  {loadingCourses ? (
                    <option>Loading...</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseName}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}

            {selectedIntermediate && selectedCourse && (
              <label className="font-semibold mb-2">
                Select semester:
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="ml-2 p-2 border text-black border-gray-300 rounded"
                >
                  <option value="">Select semester</option>
                  {loadingsemester ? (
                    <option>Loading...</option>
                  ) : (
                    semesters.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.semesterName}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}
            {selectedIntermediate && selectedCourse && selectedSemester && (
              <label className="font-semibold mb-2">
                Select Subject:
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="ml-2 p-2 border text-black border-gray-300 rounded"
                >
                  <option value="">Select Subject</option>
                  {loadingSubjects ? (
                    <option>Loading...</option>
                  ) : (
                    subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectName}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}

            {selectedIntermediate &&
              selectedCourse &&
              selectedSemester &&
              selectedSubject && (
                <label className="font-semibold mb-2">
                  Select Unit:
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="ml-2 p-2 border text-black border-gray-300 rounded"
                  >
                    <option value="">Select Unit</option>
                    {loadingUnits ? (
                      <option>Loading...</option>
                    ) : (
                      units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitName}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Universities</h2>
              {loadingIntermediates ? (
                <p>Loading...</p>
              ) : (
                intermediates.map((intermediate) => (
                  <div
                    key={intermediate.id}
                    className="flex items-center justify-between mb-2 p-2 border border-gray-300 rounded"
                  >
                    <span>{intermediate.name}</span>
                    <div>
                      <button
                        onClick={() =>
                          handleEditClick("PG", intermediate.id, intermediate)
                        }
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteIntermediate(intermediate.id)
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Courses</h2>
              {loadingCourses ? (
                <p>Loading...</p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between mb-2 p-2 border border-gray-300 rounded"
                  >
                    <span>{course.courseName}</span>
                    <div>
                      <button
                        onClick={() =>
                          handleEditClick("COURSES", course.id, course)
                        }
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">SEMESTERS</h2>
              {loadingsemester ? (
                <p>Loading...</p>
              ) : (
                semesters.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between mb-2 p-2 border border-gray-300 rounded"
                  >
                    <span>{subject.semesterName}</span>
                    <div>
                      <button
                        onClick={() =>
                          handleEditClick("SEMESTERS", subject.id, subject)
                        }
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSemester(subject.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Subjects</h2>
              {loadingSubjects ? (
                <p>Loading...</p>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between mb-2 p-2 border border-gray-300 rounded"
                  >
                    <span>{subject.subjectName}</span>
                    <div>
                      <button
                        onClick={() =>
                          handleEditClick("SUBJECTS", subject.id, subject)
                        }
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Units</h2>
              {loadingUnits ? (
                <p>Loading...</p>
              ) : (
                units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex flex-col md:flex-row items-center justify-between mb-2 p-2 border border-gray-300 rounded"
                  >
                    <div className="flex items-center mb-2 md:mb-0">
                      {/* Display Unit Image if available */}
                      {unit.unitImageUrl && (
                        <img
                          src={unit.unitImageUrl}
                          alt={unit.unitName}
                          className="w-16 h-16 object-cover mr-4 rounded" // Adjust size and style as needed
                        />
                      )}
                      <span>{unit.unitName}</span>
                    </div>
                    <div className="flex items-center">
                      {/* View PDF Button */}
                      {unit.unitPdfLink && (
                        <button
                          onClick={() =>
                            window.open(unit.unitPdfLink, "_blank")
                          }
                          className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          View PDF
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick("UNITS", unit.id, unit)}
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center text-black bg-gray-800 bg-opacity-50 p-4">
              <div className="bg-white p-4 md:p-6 rounded shadow-lg w-full md:w-1/3 max-w-md">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Edit {editing.type}
                </h2>

                {/* Dynamic Form Fields Based on the Type */}

                {editing.type === "PG" && (
                  <input
                    type="text"
                    value={editing.data.name || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, name: e.target.value },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Name"
                  />
                )}
                {editing.type === "COURSES" && (
                  <input
                    type="text"
                    value={editing.data.courseName || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, courseName: e.target.value },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Course Name"
                  />
                )}

                {editing.type === "SEMESTERS" && (
                  <input
                    type="text"
                    value={editing.data.semesterName || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, semesterName: e.target.value },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Semester Name"
                  />
                )}

                {editing.type === "SUBJECTS" && (
                  <input
                    type="text"
                    value={editing.data.subjectName || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, subjectName: e.target.value },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Subject Name"
                  />
                )}

                {editing.type === "UNITS" && (
                  <>
                    <input
                      type="text"
                      value={editing.data.unitNumber || ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: { ...editing.data, unitNumber: e.target.value },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                      placeholder="Unit Number"
                    />
                    <input
                      type="text"
                      value={editing.data.unitName || ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: { ...editing.data, unitName: e.target.value },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                      placeholder="Unit Name"
                    />
                    <input
                      type="url"
                      value={editing.data.unitImageUrl || ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: {
                            ...editing.data,
                            unitImageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                      placeholder="Unit Image URL"
                    />
                    <input
                      type="url"
                      value={editing.data.unitPdfLink || ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: {
                            ...editing.data,
                            unitPdfLink: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                      placeholder="Unit PDF Link"
                    />
                  </>
                )}

                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <button
                    onClick={handleUpdate}
                    disabled={loadingEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {loadingEdit ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntermediateList;
