"use client";

import { db } from "@/app/FirebaseConfig"; // Import your Firebase config
import ItemContext from "@/app/ItemContext";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { HashLoader } from "react-spinners"; // For loading spinner

const IntermediateTables = ({ collectionName }) => {
  const { setUnitId, setYearId, setClassId, setCourseId, setSubjectId } =
    useContext(ItemContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const groupDataByYear = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = [];
      }
      acc[item.year].push(item);
      return acc;
    }, {});
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const intermediateRef = collection(db, collectionName);
        const intermediateSnapshot = await getDocs(intermediateRef);
        const intermediateData = [];

        for (const yearDoc of intermediateSnapshot.docs) {
          const yearName = yearDoc.data().name || "N/A";
          const yearId = yearDoc.id;
          const coursesRef = collection(
            db,
            `${collectionName}/${yearDoc.id}/courses`
          );
          const coursesSnapshot = await getDocs(coursesRef);

          for (const courseDoc of coursesSnapshot.docs) {
            const courseName = courseDoc.data().courseName || "N/A";
            const courseId = courseDoc.id;
            const subjectsRef = collection(
              db,
              `${collectionName}/${yearDoc.id}/courses/${courseDoc.id}/subjects`
            );
            const subjectsSnapshot = await getDocs(subjectsRef);

            for (const subjectDoc of subjectsSnapshot.docs) {
              const subjectName = subjectDoc.data().subjectName || "N/A";
              const subjectId = subjectDoc.id;
              const unitsRef = collection(
                db,
                `${collectionName}/${yearDoc.id}/courses/${courseDoc.id}/subjects/${subjectDoc.id}/units`
              );
              const unitsSnapshot = await getDocs(unitsRef);

              unitsSnapshot.docs.forEach((unitDoc) => {
                const unitData = unitDoc.data();
                intermediateData.push({
                  year: yearName,
                  yearId,
                  courseId,
                  subjectId,
                  course: courseName,
                  subject: subjectName,
                  unitName: unitData.unitName || "N/A",
                  unitNumber: unitData.unitNumber || "N/A",
                  unitId: unitDoc.id, // Firestore ID as unitId
                  unitImageUrl: unitData.unitImageUrl || null,
                  unitPdfLink: unitData.unitPdfLink || null,
                });
              });
            }
          }
        }

        setData(groupDataByYear(intermediateData)); // Group data by year
      } catch (error) {
        console.error("Error fetching data: ", error.message);
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddQuiz = (unitId, year, courseId, subjectId) => {
    setUnitId(unitId);
    setYearId(year); // Use year instead of yearId if that's how it's structured
    setSubjectId(subjectId);
    setCourseId(courseId);
    router.push("/dashboard/InterQuiz");
  };

  const handleViewQuiz = (unitId, year, courseId, subjectId) => {
    setUnitId(unitId);
    setYearId(year); // Use year instead of yearId if that's how it's structured
    setSubjectId(subjectId);
    setCourseId(courseId);
    router.push("/dashboard/interQuizList");
  };

  const handlePlayQuiz = (yearId, unitId, courseId, subjectId) => {
    // Console log to ensure values are correctly passed
    console.log(
      "unitId:",
      unitId,
      "courseId:",
      courseId,
      "subjectId:",
      subjectId,
      "yearId:",
      yearId
    );

    // Set the context or state values
    setYearId(yearId);
    setCourseId(courseId);
    setSubjectId(subjectId);
    setUnitId(unitId);

    // Navigate to the quiz page
    router.push("/dashboard/InterQuizzes");
  };

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

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No data available.
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
                Year
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Course
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
                Unit Image
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Unit PDF
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Quizzes
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([year, courses], yearIndex) =>
              courses.map((item, courseIndex) => (
                <tr key={`${year}-${courseIndex}`}>
                  <td className="border border-gray-300 px-4 py-2">
                    {courseIndex === 0 ? year : ""}{" "}
                    {/* Display year only once */}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.subject}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.unitNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.unitName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.unitImageUrl ? (
                      <div className="flex items-center space-x-4">
                        <a
                          href={item.unitImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          [View Image]
                        </a>
                        <img
                          src={item.unitImageUrl}
                          alt={`Unit ${item.unitNumber} image`}
                          className="w-16 h-auto rounded-md shadow-sm hover:shadow-md transition-shadow"
                        />
                      </div>
                    ) : (
                      "No image available"
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.unitPdfLink ? (
                      <div className="flex gap-2">
                        <a
                          href={item.unitPdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          [view Pdf]
                        </a>
                      </div>
                    ) : (
                      "No PDF available"
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-3"
                      onClick={() =>
                        handleAddQuiz(
                          item.unitId,
                          courses[courseIndex].courseId, // Pass courseId from course data
                          item.subjectId, // Pass subjectId from item data
                          year // Pass yearId from the current year
                        )
                      }
                    >
                      Add Quiz
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-3"
                      onClick={() =>
                        handleViewQuiz(
                          item.unitId,
                          courses[courseIndex].courseId, // Pass courseId from course data
                          item.subjectId, // Pass subjectId from item data
                          year // Pass yearId from the current year
                        )
                      }
                    >
                      View Quiz
                    </button>

                    <button
                      className="bg-blue-500  text-white px-4 py-2 rounded hover:bg-blue-600 ml-3"
                      onClick={() =>
                        handlePlayQuiz(
                          item.unitId,
                          courses[courseIndex].courseId, // Pass courseId from course data
                          item.subjectId, // Pass subjectId from item data
                          year // subjectId exists in the item
                        )
                      }
                    >
                      Quiz
                    </button>
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

export default IntermediateTables;
