"use client"; // Assuming you are using Next.js with client components

import React, { useEffect, useState, useContext } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext"; // Assuming you still need this context for classId, subjectId, and unitId

const QuizList = () => {
  const { yearId, subjectId, unitId, setIndexx, courseId } =
    useContext(ItemContext);
  const [quizzesData, setQuizzesData] = useState([]);
  const router = useRouter(); // Initialize useRouter for navigation

  // Fetch quizzes when classId, subjectId, or unitId change
  useEffect(() => {
    console.log(
      "yearId:",
      yearId,
      "courseId:",
      courseId,
      "subjectId:",
      subjectId,
      "unitId:",
      unitId
    ); // Log values to check

    if (yearId && courseId && subjectId && unitId) {
      const quizzesRef = collection(
        db,
        `INTERMEDIATE_QUIZ/${yearId}/courses/${courseId}/subjects/${subjectId}/units/${unitId}/quizzes`
      );

      const unsubscribe = onSnapshot(
        quizzesRef,
        (quizSnapshot) => {
          if (!quizSnapshot.empty) {
            const quizzes = quizSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setQuizzesData(quizzes);
          } else {
            console.error("No quiz data found in Firestore!");
            setQuizzesData([]);
          }
        },
        (error) => {
          console.error("Error fetching quiz data:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [yearId, courseId, subjectId, unitId]);

  // Log quizzesData when it changes
  useEffect(() => {
    console.log("Updated quizzesData:", quizzesData);
  }, [quizzesData]);

  const handleQuizClick = (quizId, index) => {
    setIndexx(index);
    // Navigate to the SSCQUIZ component with quizId as a query parameter or in the route
    router.push("/dashboard/SSCQUIZ"); // Adjust the route according to your app structure
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>

      {/* Display yearId, courseId, subjectId, and unitId */}
      <div className="mb-4 p-4 bg-gray-100 rounded text-black">
        <p>
          <strong>Year ID:</strong> {yearId}
        </p>
        <p>
          <strong>Course ID:</strong> {courseId}
        </p>
        <p>
          <strong>Subject ID:</strong> {subjectId}
        </p>
        <p>
          <strong>Unit ID:</strong> {unitId}
        </p>
      </div>

      {/* Quiz buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzesData.map((quiz, index) => (
          <button
            key={quiz.id}
            onClick={() => handleQuizClick(quiz.id, index)}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            {quiz.id} {/* Display quiz ID as button text */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
