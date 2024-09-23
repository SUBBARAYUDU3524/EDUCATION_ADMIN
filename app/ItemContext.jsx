"use client";
import React, { createContext, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";

// Create Context
const ItemContext = createContext();

// Create Provider Component
export const ItemProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitId, setUnitId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Fetch classes
  const fetchClasses = () => {
    setLoadingClasses(true);
    const classRef = collection(db, "SSC");
    const unsubscribe = onSnapshot(classRef, (snapshot) => {
      const classList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
      setLoadingClasses(false);
    });

    return unsubscribe; // Returning unsubscribe function
  };

  // Fetch subjects for the selected class
  const fetchSubjects = (selectedClass) => {
    if (selectedClass) {
      setLoadingSubjects(true);
      const subjectRef = collection(db, `SSC/${selectedClass}/subjects`);
      const unsubscribe = onSnapshot(subjectRef, (snapshot) => {
        const subjectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjects(subjectList);
        setLoadingSubjects(false);
      });

      return unsubscribe; // Returning unsubscribe function
    } else {
      setSubjects([]);
      setUnits([]); // Clear units when no subject is selected
    }
  };

  // Fetch units for the selected subject
  const fetchUnits = (selectedClass, selectedSubject) => {
    if (selectedClass && selectedSubject) {
      setLoadingUnits(true);
      const unitRef = collection(
        db,
        `SSC/${selectedClass}/subjects/${selectedSubject}/units`
      );
      const unsubscribe = onSnapshot(unitRef, (snapshot) => {
        const unitList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUnits(unitList);
        setLoadingUnits(false);
      });

      return unsubscribe; // Returning unsubscribe function
    } else {
      setUnits([]);
    }
  };

  return (
    <ItemContext.Provider
      value={{
        classes,
        subjects,
        units,
        loadingClasses,
        loadingSubjects,
        loadingUnits,
        fetchClasses,
        fetchSubjects,
        fetchUnits,
        unitId,
        setUnitId,
        subjectId,
        setClassId,
        setSubjectId,
        classId,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export default ItemContext;
