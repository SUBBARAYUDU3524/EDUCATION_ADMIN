"use client"; // Assuming you are using Next.js with client components

import React, { useEffect, useState, useContext } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext"; // Assuming you still need this context for classId, subjectId, and unitId

const QuizList = () => {
  const { classId, subjectId, unitId, setIndexx } = useContext(ItemContext);
  const [quizzesData, setQuizzesData] = useState([]);
  const router = useRouter(); // Initialize useRouter for navigation

  // Fetch quizzes when classId, subjectId, or unitId change
  useEffect(() => {
    if (classId && subjectId && unitId) {
      const quizzesRef = collection(
        db,
        `SSC_QUIZ/${classId}/subjects/${subjectId}/units/${unitId}/quizzes`
      );

      const unsubscribe = onSnapshot(
        quizzesRef,
        (quizSnapshot) => {
          if (!quizSnapshot.empty) {
            const quizzes = quizSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Directly set quizzes data without additional mapping
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
  }, [classId, subjectId, unitId]);

  const handleQuizClick = (quizId, index) => {
    setIndexx(index);
    // Navigate to the SSCQUIZ component with quizId as a query parameter or in the route
    router.push("/dashboard/SSCQUIZ"); // Adjust the route according to your app structure
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>
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
