"use client";
import { useState, useEffect, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext";
import { Toaster } from "react-hot-toast";

const SSCQuizTable = () => {
  const [quizzesData, setQuizzesData] = useState([]);
  const { subjectId, unitId, classId } = useContext(ItemContext); // Assuming these come from context

  // Fetch quizzes data from Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (classId && subjectId && unitId) {
        try {
          const quizzesRef = collection(
            db,
            `SSC_QUIZ/${classId}/subjects/${subjectId}/units/${unitId}/quizzes`
          );

          // Fetch all quizzes from Firestore
          const quizSnapshot = await getDocs(quizzesRef);
          const quizzes = quizSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch questions for each quiz
          const fetchedQuizzes = quizzes.map((quiz) => ({
            quizNumber: quiz.quizTitle,
            questions: quiz.questions || [],
          }));

          setQuizzesData(fetchedQuizzes);
        } catch (error) {
          console.error("Error fetching quizzes:", error);
        }
      }
    };

    fetchQuizzes();
  }, [classId, subjectId, unitId]);

  console.log(classId, subjectId, unitId);
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Quiz Data</h2>
      <table className="min-w-full bg-white text-black">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Quiz Name</th>
            <th className="px-4 py-2 border">Question</th>
            <th className="px-4 py-2 border">Options</th>
            <th className="px-4 py-2 border">Correct Option</th>
          </tr>
        </thead>
        <tbody className="text-white bg-black text-center">
          {quizzesData.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-600">
                No quizzes available
              </td>
            </tr>
          ) : (
            quizzesData.map((quiz) =>
              quiz.questions.map((question, index) => (
                <tr key={`${quiz.quizNumber}-${index}`}>
                  <td className="px-4 py-2 border text-center">
                    {quiz.quizNumber}
                  </td>
                  <td className="px-4 py-2 border">{question.question}</td>
                  <td className="px-4 py-2 border">
                    {question.options.map((option, i) => (
                      <div key={i}>{option}</div>
                    ))}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {question.correctOption}
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
      <Toaster />
    </div>
  );
};

export default SSCQuizTable;
