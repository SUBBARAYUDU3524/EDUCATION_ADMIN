"use client";
import { useEffect, useState, useContext } from "react";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext";
import toast, { Toaster } from "react-hot-toast";

const BtechQuizList = () => {
  // Context to get necessary IDs
  const {
    unitId: contextUnitId,
    subjectId: contextSubjectId,
    semesterId: contextSemesterId,
    universityId: contextUniversityId,
  } = useContext(ItemContext);

  // State Variables
  const [unitId, setUnitId] = useState(
    localStorage.getItem("unitId") || contextUnitId
  );
  const [subjectId, setSubjectId] = useState(
    localStorage.getItem("subjectId") || contextSubjectId
  );
  const [semesterId, setSemesterId] = useState(
    localStorage.getItem("semesterId") || contextSemesterId
  );
  const [universityId, setUniversityId] = useState(
    localStorage.getItem("universityId") || contextUniversityId
  );
  const [quizOptions, setQuizOptions] = useState([]);

  // Fetch quizzes when IDs change
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (universityId && semesterId && subjectId && unitId) {
        try {
          const quizzesCollectionRef = collection(
            db,
            `BTECH_QUIZ/${universityId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`
          );
          const quizzesSnapshot = await getDocs(quizzesCollectionRef);

          const quizOptions = quizzesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setQuizOptions(quizOptions);
        } catch (error) {
          console.error("Error fetching quizzes:", error);
        }
      }
    };

    fetchQuizzes();
  }, [universityId, semesterId, subjectId, unitId]);

  // Function to update quiz
  const updateQuiz = async (quizId, updatedData) => {
    const quizDocRef = doc(
      db,
      `BTECH_QUIZ/${universityId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
      quizId
    );

    await updateDoc(quizDocRef, updatedData);
    toast.success("Quiz updated successfully.");
    // Optionally refresh the quiz list after an update
    fetchQuizzes();
  };

  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-bold">Btech Quiz List</h1>

      {/* Quiz Table */}
      <div className="mt-4 text-black">
        <h2 className="text-xl font-semibold">Quiz List</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Quiz Name</th>
              <th className="border border-gray-300 px-4 py-2">Questions</th>
              <th className="border border-gray-300 px-4 py-2">Options</th>
              <th className="border border-gray-300 px-4 py-2">
                Correct Option
              </th>
              <th className="border border-gray-300 px-4 py-2">Subject ID</th>
            </tr>
          </thead>
          <tbody className="bg-black text-white text-center">
            {quizOptions.map((quiz) => (
              <tr key={quiz.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {quiz.quizTitle}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {quiz.questions.map((q, index) => (
                    <div key={index}>{q.question}</div>
                  ))}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {quiz.questions.map((q, index) => (
                    <div key={index}>
                      {q.options.map((option, idx) => (
                        <div key={idx}>{option}</div>
                      ))}
                    </div>
                  ))}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {quiz.questions.map((q, index) => (
                    <div key={index}>{q.correctOption}</div>
                  ))}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {quiz.subjectId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BtechQuizList;
