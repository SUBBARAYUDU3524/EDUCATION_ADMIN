"use client";

import { db } from "@/app/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners"; // Import the loader

const SchoolTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Function to fetch data from Firestore
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const sscRef = collection(db, "SSC");
        const classSnapshot = await getDocs(sscRef);
        const classData = [];

        for (const classDoc of classSnapshot.docs) {
          const className = classDoc.data().name || classDoc.id; // Fallback to id if name doesn't exist
          const subjectsRef = collection(db, `SSC/${classDoc.id}/subjects`);
          const subjectsSnapshot = await getDocs(subjectsRef);
          const subjectsData = [];

          for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectName = subjectDoc.data().subjectName || subjectDoc.id; // Fallback to id if subjectName doesn't exist
            const unitsRef = collection(
              db,
              `SSC/${classDoc.id}/subjects/${subjectDoc.id}/units`
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

        setData(classData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchData();
  }, []);

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
      <h1 className="text-3xl text-center mt-10 underline">SSC TABLE</h1>

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
                Unit Images
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Units
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((classItem) =>
              classItem.subjects.map((subjectItem, subjectIndex) => (
                <tr key={`${classItem.className}-${subjectItem.subject}`}>
                  {/* Class */}
                  {subjectIndex === 0 && (
                    <td
                      rowSpan={classItem.subjects.length}
                      className="border border-gray-300 px-4 py-2 font-medium text-white"
                    >
                      {classItem.className}
                    </td>
                  )}
                  {/* Subject */}
                  <td className="border border-gray-300 px-4 py-2">
                    {subjectItem.subject}
                  </td>
                  {/* Unit Images */}
                  <td className="border border-gray-300 px-4 py-2">
                    <ul>
                      {subjectItem.units.map((unit, unitIndex) => (
                        <li key={unitIndex} className="mb-2">
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
                            <span className="text-gray-500">
                              No Image Available
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Units */}
                  <td className="border border-gray-300 px-4 py-2">
                    <ul>
                      {subjectItem.units.map((unit, unitIndex) => (
                        <li key={unitIndex}>
                          {`Unit ${unit.unitNumber}: ${unit.unitName} (PDF: `}
                          <a
                            href={unit.unitPdfLink}
                            className="text-blue-500 hover:underline"
                          >
                            Link
                          </a>
                          {")"}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolTable;
