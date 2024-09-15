"use client";

import { db } from "@/app/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners"; // Import the loader

const SSCTables = ({ collectionName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch classes from the collection
        const sscRef = collection(db, collectionName);
        const classSnapshot = await getDocs(sscRef);
        const classData = [];

        // Loop through each class document
        for (const classDoc of classSnapshot.docs) {
          const className = classDoc.data().name || classDoc.id; // Fallback to id if name doesn't exist
          const subjectsRef = collection(
            db,
            `${collectionName}/${classDoc.id}/subjects`
          );
          const subjectsSnapshot = await getDocs(subjectsRef);
          const subjectsData = [];

          // Loop through each subject document
          for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectName = subjectDoc.data().subjectName || subjectDoc.id; // Fallback to id if subjectName doesn't exist
            const unitsRef = collection(
              db,
              `${collectionName}/${classDoc.id}/subjects/${subjectDoc.id}/units`
            );
            const unitsSnapshot = await getDocs(unitsRef);
            const unitsData = unitsSnapshot.docs.map((unitDoc) => ({
              ...unitDoc.data(),
            }));

            subjectsData.push({
              subject: subjectName,
              units: unitsData,
            });
          }

          classData.push({
            className: className,
            subjects: subjectsData,
          });
        }

        setData(classData); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    if (collectionName) {
      fetchData(); // Only fetch if collectionName is valid
    }
  }, [collectionName]); // Add collectionName as dependency

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#3498db" size={100} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-center mt-10 underline">
        {collectionName} TABLE
      </h1>

      <div className="overflow-x-auto p-6">
        <table className="min-w-full text-left border-collapse border border-gray-300 shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Class
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Subject
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Unit Number
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Unit Name
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Unit Images
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Unit PDF
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((classItem) =>
              classItem.subjects.map((subjectItem, subjectIndex) =>
                subjectItem.units.map((unit, unitIndex) => (
                  <tr
                    key={`${classItem.className}-${subjectItem.subject}-${unit.unitNumber}`}
                  >
                    {/* Class */}
                    {unitIndex === 0 && subjectIndex === 0 && (
                      <td
                        rowSpan={classItem.subjects.reduce(
                          (acc, subj) => acc + subj.units.length,
                          0
                        )}
                        className="border border-gray-300 px-4 py-2 font-medium "
                      >
                        {classItem.className}
                      </td>
                    )}
                    {/* Subject */}
                    {unitIndex === 0 && (
                      <td
                        rowSpan={subjectItem.units.length}
                        className="border border-gray-300 px-4 py-2 font-medium "
                      >
                        {subjectItem.subject}
                      </td>
                    )}
                    {/* Unit Number */}
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitNumber}
                    </td>
                    {/* Unit Name */}
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitName}
                    </td>
                    {/* Unit Images */}
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitImageUrl ? (
                        <div className="flex items-center space-x-4">
                          <a
                            href={unit.unitImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            [View Image]
                          </a>
                          <img
                            src={unit.unitImageUrl}
                            alt={`Unit ${unit.unitNumber} image`}
                            className="w-16 h-auto rounded-md shadow-sm hover:shadow-md transition-shadow"
                          />
                        </div>
                      ) : (
                        "No Image Available"
                      )}
                    </td>
                    {/* Unit PDF */}
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitPdfLink ? (
                        <a
                          href={unit.unitPdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          [View PDF]
                        </a>
                      ) : (
                        "No PDF Available"
                      )}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SSCTables;
