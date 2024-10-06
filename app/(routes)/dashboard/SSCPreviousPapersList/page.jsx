"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { db, storage } from "@/app/FirebaseConfig";

const SSCPreviousPapersList = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false); // Loading state for edit
  const [editing, setEditing] = useState({ type: "", id: "", data: {} });
  const [showEditModal, setShowEditModal] = useState(false); // Show/hide modal
  const collectionName = "SSC_PREVIOUS_PAPERS";
  // Fetch classes from Firestore
  useEffect(() => {
    setLoadingClasses(true);
    const classRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(classRef, (snapshot) => {
      const classList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
      setLoadingClasses(false);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Fetch subjects for the selected class
  useEffect(() => {
    if (selectedClass) {
      setLoadingSubjects(true);
      const subjectRef = collection(
        db,
        `${collectionName}/${selectedClass}/subjects`
      );
      const unsubscribe = onSnapshot(subjectRef, (snapshot) => {
        const subjectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjects(subjectList);
        setLoadingSubjects(false);
      });

      return () => unsubscribe(); // Clean up listener on unmount
    } else {
      setSubjects([]);
      setUnits([]);
    }
  }, [selectedClass]);

  // Fetch units for the selected subject
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setLoadingUnits(true);
      const unitRef = collection(
        db,
        `${collectionName}/${selectedClass}/subjects/${selectedSubject}/units`
      );
      const unsubscribe = onSnapshot(unitRef, (snapshot) => {
        const unitList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUnits(unitList);
        setLoadingUnits(false);
      });

      return () => unsubscribe(); // Clean up listener on unmount
    } else {
      setUnits([]);
    }
  }, [selectedClass, selectedSubject]);

  // Delete a class from Firestore
  const handleDeleteClass = async (classId) => {
    try {
      const subjectRef = collection(
        db,
        `${collectionName}/${classId}/subjects`
      );
      const subjectSnapshot = await getDocs(subjectRef);

      for (const subjectDoc of subjectSnapshot.docs) {
        const unitRef = collection(
          db,
          `${collectionName}/${classId}/subjects/${subjectDoc.id}/units`
        );
        const unitSnapshot = await getDocs(unitRef);

        for (const unitDoc of unitSnapshot.docs) {
          const unitData = unitDoc.data();
          if (unitData.unitImageUrl) {
            const imageRef = ref(storage, unitData.unitImageUrl);
            await deleteObject(imageRef);
          }
          if (unitData.unitPdfLink) {
            const pdfRef = ref(storage, unitData.unitPdfLink);
            await deleteObject(pdfRef);
          }
          await deleteDoc(
            doc(
              db,
              `${collectionName}/${classId}/subjects/${subjectDoc.id}/units`,
              unitDoc.id
            )
          );
        }
        await deleteDoc(
          doc(db, `${collectionName}/${classId}/subjects`, subjectDoc.id)
        );
      }

      await deleteDoc(doc(db, collectionName, classId));
      toast.success("Class deleted successfully!");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class.");
    }
  };

  // Delete a subject from Firestore
  const handleDeleteSubject = async (subjectId) => {
    try {
      const unitRef = collection(
        db,
        `${collectionName}/${selectedClass}/subjects/${subjectId}/units`
      );
      const unitSnapshot = await getDocs(unitRef);

      for (const unitDoc of unitSnapshot.docs) {
        const unitData = unitDoc.data();
        if (unitData.unitImageUrl) {
          const imageRef = ref(storage, unitData.unitImageUrl);
          await deleteObject(imageRef);
        }
        if (unitData.unitPdfLink) {
          const pdfRef = ref(storage, unitData.unitPdfLink);
          await deleteObject(pdfRef);
        }
        await deleteDoc(
          doc(
            db,
            `${collectionName}/${selectedClass}/subjects/${subjectId}/units`,
            unitDoc.id
          )
        );
      }

      await deleteDoc(
        doc(db, `${collectionName}/${selectedClass}/subjects`, subjectId)
      );
      toast.success("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject.");
    }
  };

  // Delete a unit from Firestore
  const handleDeleteUnit = async (unitId, unitImageUrl, unitPdfLink) => {
    try {
      const unitDocRef = doc(
        db,
        `${collectionName}/${selectedClass}/subjects/${selectedSubject}/units`,
        unitId
      );

      await deleteDoc(unitDocRef);

      if (unitImageUrl) {
        const imageRef = ref(storage, unitImageUrl);
        await deleteObject(imageRef);
      }

      if (unitPdfLink) {
        const pdfRef = ref(storage, unitPdfLink);
        await deleteObject(pdfRef);
      }

      toast.success("Unit deleted successfully!");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit.");
    }
  };

  // Handle edit functionality
  const handleEdit = (type, id, data) => {
    setEditing({ type, id, data });
    setShowEditModal(true); // Show modal when edit is triggered
  };

  // Save edited class/subject/unit
  const handleSave = async () => {
    setLoadingEdit(true); // Set loading state for save
    try {
      const { type, id, data } = editing;
      if (type === "class") {
        await updateDoc(doc(db, collectionName, id), { name: data.name });
      } else if (type === "subject") {
        await updateDoc(
          doc(db, `${collectionName}/${selectedClass}/subjects`, id),
          {
            subjectName: data.subjectName,
          }
        );
      } else if (type === "unit") {
        await updateDoc(
          doc(
            db,
            `${collectionName}/${selectedClass}/subjects/${selectedSubject}/units`,
            id
          ),
          {
            unitName: data.unitName,
            unitNumber: data.unitNumber,
            unitImageUrl: data.unitImageUrl,
            unitPdfLink: data.unitPdfLink,
          }
        );
      }
      setEditing({ type: "", id: "", data: {} });
      setShowEditModal(false);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update.");
    }
    setLoadingEdit(false); // Reset loading state
  };

  return (
    <div>
      <h1 className="text-3xl text-center mt-10 underline">
        {collectionName} LIST
      </h1>

      <div className="p-6 max-w-lg mx-auto mt-10 bg-black border rounded-lg shadow-tr">
        <Toaster position="top-right" />
        <h2 className="text-2xl font-bold mb-4">
          Manage Classes, Subjects, and Units
        </h2>

        {/* Class Selection and Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Classes</h3>
          {loadingClasses ? (
            <p>Loading classes...</p>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="flex justify-between items-center my-2"
              >
                <span>{cls.name}</span>
                <div>
                  <button
                    onClick={() =>
                      handleEdit("class", cls.id, { name: cls.name })
                    }
                    className="text-blue-500 hover:bg-blue-100 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subject Selection and Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Subjects</h3>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg pl-3 p-4"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {loadingSubjects ? (
            <p>Loading subjects...</p>
          ) : (
            subjects?.map((sub) => (
              <div
                key={sub.id}
                className="flex justify-between items-center my-2"
              >
                <span>{sub.subjectName}</span>
                <div>
                  <button
                    onClick={() =>
                      handleEdit("subject", sub.id, {
                        subjectName: sub.subjectName,
                      })
                    }
                    className="text-blue-500 hover:bg-blue-100 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(sub.id)}
                    className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Unit Selection and Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Previous Paper Year</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block w-full text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg pl-3 p-4"
          >
            <option value="">Select a subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subjectName}
              </option>
            ))}
          </select>
          {loadingUnits ? (
            <p>Loading units...</p>
          ) : (
            units.map((unit) => (
              <div
                key={unit.id}
                className="flex justify-between items-center my-2"
              >
                <div>
                  <h3 className="font-semibold">
                    Prev_Paper_Year : {unit.unitName}
                  </h3>

                  {unit.unitImageUrl && (
                    <img
                      src={unit.unitImageUrl}
                      alt="Unit"
                      className="w-24 h-24 object-cover"
                    />
                  )}
                  {unit.unitPdfLink && (
                    <a
                      href={unit.unitPdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View PDF
                    </a>
                  )}
                </div>
                <div>
                  <button
                    onClick={() =>
                      handleEdit("unit", unit.id, {
                        unitName: unit.unitName,
                        unitNumber: unit.unitNumber,
                        unitImageUrl: unit.unitImageUrl,
                        unitPdfLink: unit.unitPdfLink,
                      })
                    }
                    className="text-blue-500 hover:bg-blue-100 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteUnit(
                        unit.id,
                        unit.unitImageUrl,
                        unit.unitPdfLink
                      )
                    }
                    className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-black">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-xl font-semibold mb-4">
                Edit {editing.type}
              </h3>
              <div>
                {editing.type === "class" && (
                  <div>
                    <label className="block mb-2">
                      Class Name
                      <input
                        type="text"
                        value={editing.data.name}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, name: e.target.value },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                  </div>
                )}
                {editing.type === "subject" && (
                  <div>
                    <label className="block mb-2">
                      Subject Name
                      <input
                        type="text"
                        value={editing.data.subjectName}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              subjectName: e.target.value,
                            },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                  </div>
                )}
                {editing.type === "unit" && (
                  <div>
                    <label className="block mb-2">
                      Unit Name
                      <input
                        type="text"
                        value={editing.data.unitName}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, unitName: e.target.value },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                    <label className="block mb-2">
                      Unit Number
                      <input
                        type="text"
                        value={editing.data.unitNumber}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              unitNumber: e.target.value,
                            },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                    <label className="block mb-2">
                      Unit Image URL
                      <input
                        type="text"
                        value={editing.data.unitImageUrl}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              unitImageUrl: e.target.value,
                            },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                    <label className="block mb-2">
                      Unit PDF Link
                      <input
                        type="text"
                        value={editing.data.unitPdfLink}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              unitPdfLink: e.target.value,
                            },
                          })
                        }
                        className="block w-full border border-gray-300 rounded-md p-4 text-lg pl-3"
                      />
                    </label>
                  </div>
                )}
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white p-3 rounded-md text-lg"
                  disabled={loadingEdit}
                >
                  {loadingEdit ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="ml-2 bg-gray-400 text-white p-3 rounded-md text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSCPreviousPapersList;
