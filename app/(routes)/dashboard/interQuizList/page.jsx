"use client";
import { useEffect, useState, useContext } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext";
import toast, { Toaster } from "react-hot-toast";
import { Dialog } from "@headlessui/react";

const AddQuiz = () => {
  const currentUserId = auth.currentUser?.uid;
  const {
    unitId: contextUnitId,
    subjectId: contextSubjectId,
    courseId: contextCourseId,
    yearId: contextYearId,
  } = useContext(ItemContext);

  const [unitId, setUnitId] = useState(
    localStorage.getItem("unitId") || contextUnitId
  );

  const [subjectId, setSubjectId] = useState(
    localStorage.getItem("subjectId") || contextSubjectId
  );

  const [courseId, setCourseId] = useState(
    localStorage.getItem("courseId") || contextCourseId
  );

  const [yearId, setYearId] = useState(
    localStorage.getItem("yearId") || contextYearId
  );

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctOption: "",
      explanation: "",
      isVisible: false,
    },
  ]);

  const [quizOptions, setQuizOptions] = useState([]);

  // Fetch quizzes when identifiers change
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (yearId && courseId && subjectId && unitId) {
        try {
          const quizzesCollectionRef = collection(
            db,
            `INTERMEDIATE_QUIZ/${yearId}/courses/${courseId}/subjects/${subjectId}/units/${unitId}/quizzes`
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
  }, [yearId, courseId, subjectId, unitId]);

  // Function to update quiz
  const updateQuiz = async (quizId, updatedData) => {
    const quizDocRef = doc(
      db,
      `INTERMEDIATE_QUIZ/${yearId}/courses/${courseId}/subjects/${subjectId}/units/${unitId}/quizzes`,
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
      <h1 className="text-2xl font-bold">Add Quiz</h1>
      {/* Form for adding a new quiz */}
      {/* Existing form fields for quiz creation would go here */}

      {/* Quiz Table */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Quiz List</h2>
        <table className="min-w-full border border-gray-300">
          <thead>
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
          <tbody>
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
                  {quiz.correctOption}
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
