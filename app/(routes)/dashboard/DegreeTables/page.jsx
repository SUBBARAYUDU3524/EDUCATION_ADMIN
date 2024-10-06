"use client";

import { db } from "@/app/FirebaseConfig"; // Import your Firebase config
import ItemContext from "@/app/ItemContext";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import { HashLoader } from "react-spinners"; // For loading spinner

// Group by function
const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const DegreeTables = ({ collectionName }) => {
  const {
    setUniversityId,
    setCourseId,
    setSemesterId,
    setSubjectId,
    setUnitId,
  } = useContext(ItemContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const degreeRef = collection(db, collectionName);
        const degreeSnapshot = await getDocs(degreeRef);
        const degreeData = [];

        for (const degreeDoc of degreeSnapshot.docs) {
          const universityId = degreeDoc.id;
          const name = degreeDoc.data().name || "N/A";

          const coursesRef = collection(
            db,
            `${collectionName}/${universityId}/courses`
          );
          const coursesSnapshot = await getDocs(coursesRef);

          const courses = coursesSnapshot.docs
            .map((courseDoc) => ({
              courseId: courseDoc.id,
              courseName: courseDoc.data().courseName || "N/A",
            }))
            .sort((a, b) => a.courseName.localeCompare(b.courseName)); // Sort courses alphabetically

          for (const { courseId, courseName } of courses) {
            const semestersRef = collection(
              db,
              `${collectionName}/${universityId}/courses/${courseId}/semesters`
            );
            const semestersSnapshot = await getDocs(semestersRef);

            const semesters = semestersSnapshot.docs
              .map((semesterDoc) => ({
                semesterId: semesterDoc.id,
                semesterName: semesterDoc.data().semesterName || "N/A",
              }))
              .sort((a, b) => a.semesterName.localeCompare(b.semesterName)); // Sort semesters in ascending order

            for (const { semesterId, semesterName } of semesters) {
              const subjectsRef = collection(
                db,
                `${collectionName}/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects`
              );
              const subjectsSnapshot = await getDocs(subjectsRef);

              for (const subjectDoc of subjectsSnapshot.docs) {
                const subjectId = subjectDoc.id;
                const subjectName = subjectDoc.data().subjectName || "N/A";

                const unitsRef = collection(
                  db,
                  `${collectionName}/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units`
                );
                const unitsSnapshot = await getDocs(unitsRef);

                unitsSnapshot.docs.forEach((unitDoc) => {
                  const unitId = unitDoc.id;
                  const unitData = unitDoc.data();
                  degreeData.push({
                    name,
                    courseName,
                    semesterName,
                    subjectName,
                    unitId,
                    subjectId,
                    courseId,
                    semesterId,
                    universityId,
                    unitName: unitData.unitName || "N/A",
                    unitNumber: unitData.unitNumber || "N/A",
                    unitImageUrl: unitData.unitImageUrl || null,
                    unitPdfLink: unitData.unitPdfLink || null,
                  });
                });
              }
            }
          }
        }

        // Group data by university name
        const groupedData = groupBy(degreeData, "name");

        console.log("Fetched and grouped degree data:", groupedData);
        setData(groupedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddQuiz = (
    unitId,
    universityId,
    courseId,
    subjectId,
    semesterId
  ) => {
    setUnitId(unitId);
    setSubjectId(subjectId);
    setSemesterId(semesterId);
    setUniversityId(universityId);
    setCourseId(courseId);
    router.push("/dashboard/DegreeQuiz");
  };

  const handleViewQuiz = (
    unitId,
    universityId,
    courseId,
    subjectId,
    semesterId
  ) => {
    setUnitId(unitId);
    setSubjectId(subjectId);
    setSemesterId(semesterId);
    setUniversityId(universityId);
    setCourseId(courseId);
    router.push("/dashboard/DegreeQuizList");
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
        {Object.keys(data).map((universityName, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{universityName}</h2>
            <table className="min-w-full text-left border-collapse border border-gray-300 shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Course
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                    Semester
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
                {data[universityName].map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.courseName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.semesterName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.subjectName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.unitNumber}
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
                          [ view PDF]
                        </a>
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
                            item.universityId,
                            item.courseId,
                            item.subjectId,
                            item.semesterId
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
                            item.universityId,
                            item.courseId,
                            item.subjectId,
                            item.semesterId
                          )
                        }
                      >
                        View Quiz
                      </button>
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

export default DegreeTables;
