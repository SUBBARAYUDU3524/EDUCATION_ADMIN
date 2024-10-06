"use client";
import { useEffect, useState, useContext } from "react";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext";
import toast, { Toaster } from "react-hot-toast";

const AddQuiz = () => {
  const currentUserId = auth.currentUser?.uid;

  // Context to get the necessary IDs
  const {
    unitId: contextUnitId,
    subjectId: contextSubjectId,
    courseId: contextCourseId,
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
  const [courseId, setCourseId] = useState(
    localStorage.getItem("courseId") || contextCourseId
  );
  const [semesterId, setSemesterId] = useState(
    localStorage.getItem("semesterId") || contextSemesterId
  );
  const [universityId, setUniversityId] = useState(
    localStorage.getItem("universityId") || contextUniversityId
  );

  const [quizOptions, setQuizOptions] = useState([]);

  // Fetch quizzes when identifiers change
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (universityId && semesterId && courseId && subjectId && unitId) {
        try {
          const quizzesCollectionRef = collection(
            db,
            `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`
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
  }, [universityId, semesterId, courseId, subjectId, unitId]);

  // Function to update quiz
  const updateQuiz = async (quizId, updatedData) => {
    const quizDocRef = doc(
      db,
      `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
      quizId
    );

    await updateDoc(quizDocRef, updatedData);
    toast.success("Quiz updated successfully.");
    // Optionally refresh the quiz list after an update
    fetchQuizzes();
  };

  // Table for displaying quizzes
  return (
    <div>
      <Toaster />

      {/* Quiz Table */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold text-center mb-10">
          Degree Quiz List
        </h2>
        <table className="min-w-full border border-gray-300">
          <thead className="text-center">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Quiz Name</th>
              <th className="border border-gray-300 px-4 py-2">Questions</th>
              <th className="border border-gray-300 px-4 py-2">Options</th>
              <th className="border border-gray-300 px-4 py-2">
                Correct Option
              </th>
              <th className="border border-gray-300 px-4 py-2">Course ID</th>
            </tr>
          </thead>
          <tbody className="text-center">
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
                  {quiz.courseId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddQuiz;
