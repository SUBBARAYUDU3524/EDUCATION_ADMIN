"use client";

import { db } from "@/app/FirebaseConfig"; // Firebase config
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners"; // For loading spinner

const BTechTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const degreeRef = collection(db, "MEDICAL");
        const degreeSnapshot = await getDocs(degreeRef);
        const degreeData = [];

        // Loop through each university/branch
        for (const degreeDoc of degreeSnapshot.docs) {
          const universityId = degreeDoc.id;
          const name = degreeDoc.data().name || "N/A";

          // Get semesters for each university
          const semestersRef = collection(
            db,
            `MEDICAL/${universityId}/semesters`
          );
          const semestersSnapshot = await getDocs(semestersRef);

          const semesters = semestersSnapshot.docs
            .map((semesterDoc) => ({
              semesterId: semesterDoc.id,
              semesterName: semesterDoc.data().semesterName || "N/A",
            }))
            .sort((a, b) => a.semesterName.localeCompare(b.semesterName)); // Sort semesters in ascending order

          // Loop through each semester
          for (const { semesterId, semesterName } of semesters) {
            const subjectsRef = collection(
              db,
              `MEDICAL/${universityId}/semesters/${semesterId}/subjects`
            );
            const subjectsSnapshot = await getDocs(subjectsRef);

            // Loop through each subject
            for (const subjectDoc of subjectsSnapshot.docs) {
              const subjectId = subjectDoc.id;
              const subjectName = subjectDoc.data().subjectName || "N/A";

              const unitsRef = collection(
                db,
                `MEDICAL/${universityId}/semesters/${semesterId}/subjects/${subjectId}/units`
              );
              const unitsSnapshot = await getDocs(unitsRef);

              // Loop through each unit and prepare data for the table
              unitsSnapshot.docs.forEach((unitDoc) => {
                const unitData = unitDoc.data();
                degreeData.push({
                  name,
                  semesterName,
                  subjectName,
                  unitName: unitData.unitName || "N/A",
                  unitImageUrl: unitData.unitImageUrl || null,
                  unitPdfLink: unitData.unitPdfLink || null,
                });
              });
            }
          }
        }

        console.log("Fetched degree data: ", degreeData);
        setData(degreeData);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#3498db" size={100} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No data available.
      </div>
    );
  }

  // Group the data by university/branch
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.name]) {
      acc[curr.name] = [];
    }
    acc[curr.name].push(curr);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl text-center mt-10 underline">MEDICAL TABLE</h1>

      <div className="overflow-x-auto p-6">
        {Object.keys(groupedData).map((universityName, index) => (
          <div key={index} className="mb-8">
            {/* University/Branch Name */}
            <h2 className="text-xl font-bold mb-4">
              Branch Name : {universityName}
            </h2>

            {/* Single table with semesters within */}
            <table className="min-w-full text-left border-collapse border border-gray-300 shadow-md mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Semester
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Unit Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Unit Image
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Unit PDF
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedData[universityName].map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.semesterName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.subjectName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.unitName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.unitImageUrl ? (
                        <div className="flex gap-2">
                          <a
                            href={item.unitImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500"
                          >
                            [view full image]
                          </a>
                          <img
                            src={item.unitImageUrl}
                            alt="Unit"
                            height={50}
                            width={50}
                          />
                        </div>
                      ) : (
                        "No image available"
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.unitPdfLink ? (
                        <a
                          href={item.unitPdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          [view PDF]
                        </a>
                      ) : (
                        "No PDF available"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BTechTable;
