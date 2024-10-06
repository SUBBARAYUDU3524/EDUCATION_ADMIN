"use client";

import { auth, db } from "@/app/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import { HashLoader } from "react-spinners"; // Import the loader
import ItemContext from "@/app/ItemContext";

const SSCTables = ({ collectionName }) => {
  const { setUnitId, setClassId, setSubjectId } = useContext(ItemContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter(); // For navigation
  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;
  console.log(data);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const sscRef = collection(db, collectionName);
        const classSnapshot = await getDocs(sscRef);
        const classData = [];

        for (const classDoc of classSnapshot.docs) {
          const className = classDoc.data().name || classDoc.id;
          const classId = classDoc.id; // Fallback to id if name doesn't exist
          const subjectsRef = collection(
            db,
            `${collectionName}/${classDoc.id}/subjects`
          );
          const subjectsSnapshot = await getDocs(subjectsRef);
          const subjectsData = [];

          for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectName = subjectDoc.data().subjectName || subjectDoc.id;
            const subjectId = subjectDoc.id;
            const unitsRef = collection(
              db,
              `${collectionName}/${classDoc.id}/subjects/${subjectDoc.id}/units`
            );
            const unitsSnapshot = await getDocs(unitsRef);
            const unitsData = unitsSnapshot.docs.map((unitDoc) => ({
              ...unitDoc.data(),
              unitId: unitDoc.id,
            }));

            subjectsData.push({
              subject: subjectName,
              subjectId: subjectId,
              units: unitsData,
            });
          }

          classData.push({
            className: className,
            classId: classId,
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
  }, [collectionName]);

  // Function to handle navigation to AddQuiz
  const handleAddQuiz = (unitId, classId, subjectId) => {
    setUnitId(unitId);
    setClassId(classId);
    setSubjectId(subjectId);
    router.push("/dashboard/addQuiz");
  };
  const handleViewQuiz = (unitId, classId, subjectId) => {
    setUnitId(unitId);
    setClassId(classId);
    setSubjectId(subjectId);
    router.push("/dashboard/SSCQuizList");
  };

  const handlePlayQuiz = (unitId, classId, subjectId) => {
    setUnitId(unitId);
    setClassId(classId);
    setSubjectId(subjectId);
    router.push("/dashboard/sscquizzes");
  };

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
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Quiz
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
                    {unitIndex === 0 && subjectIndex === 0 && (
                      <td
                        rowSpan={classItem.subjects.reduce(
                          (acc, subj) => acc + subj.units.length,
                          0
                        )}
                        className="border border-gray-300 px-4 py-2 font-medium"
                      >
                        {classItem.className}
                      </td>
                    )}
                    {unitIndex === 0 && (
                      <td
                        rowSpan={subjectItem.units.length}
                        className="border border-gray-300 px-4 py-2 font-medium"
                      >
                        {subjectItem.subject}
                      </td>
                    )}
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {unit.unitName}
                    </td>
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
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-blue-500  text-white px-4 py-2 rounded hover:bg-blue-600 mr-3"
                        onClick={
                          () =>
                            handleAddQuiz(
                              unit?.unitId,
                              classItem?.classId,
                              subjectItem?.subjectId
                            ) // Pass all three ids
                        }
                      >
                        Add Quiz
                      </button>
                      <button
                        className="bg-blue-500  text-white px-4 py-2 rounded hover:bg-blue-600 ml-3"
                        onClick={
                          () =>
                            handleViewQuiz(
                              unit?.unitId,
                              classItem?.classId,
                              subjectItem?.subjectId
                            ) // Pass all three ids
                        }
                      >
                        View Quiz
                      </button>
                      <button
                        className="bg-blue-500  text-white px-4 py-2 rounded hover:bg-blue-600 ml-3"
                        onClick={
                          () =>
                            handlePlayQuiz(
                              unit?.unitId,
                              classItem?.classId,
                              subjectItem?.subjectId
                            ) // Pass all three ids
                        }
                      >
                        Quiz
                      </button>
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
