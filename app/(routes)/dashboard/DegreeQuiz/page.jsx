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
import { Dialog } from "@headlessui/react"; // Import Dialog from Headless UI

const DegreeQuiz = () => {
  const currentUserId = auth.currentUser?.uid;
  const {
    unitId: contextUnitId,
    subjectId: contextSubjectId,
    courseId: contextCourseId,
    universityId: contextUniversityId, // Add universityId from context
    semesterId: contextSemesterId, // Add semesterId from context
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

  const [universityId, setUniversityId] = useState(
    localStorage.getItem("universityId") || contextUniversityId // Initialize universityId
  );

  const [semesterId, setSemesterId] = useState(
    localStorage.getItem("semesterId") || contextSemesterId // Initialize semesterId
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

  const [loading, setLoading] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [newQuizNumber, setNewQuizNumber] = useState("");
  const [inputQuizNumber, setInputQuizNumber] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync state with localStorage and context values on change
  useEffect(() => {
    if (contextUnitId !== unitId) {
      setUnitId(contextUnitId);
      localStorage.setItem("unitId", contextUnitId);
    }
  }, [contextUnitId, unitId]);

  useEffect(() => {
    if (contextUniversityId !== universityId) {
      setUniversityId(contextUniversityId);
      localStorage.setItem("universityId", contextUniversityId);
    }
  }, [contextUniversityId, universityId]);

  useEffect(() => {
    if (contextSemesterId !== semesterId) {
      setSemesterId(contextSemesterId);
      localStorage.setItem("semesterId", contextSemesterId);
    }
  }, [contextSemesterId, semesterId]);

  useEffect(() => {
    if (contextCourseId !== courseId) {
      setCourseId(contextCourseId);
      localStorage.setItem("courseId", contextCourseId);
    }
  }, [contextCourseId, courseId]);

  useEffect(() => {
    if (contextSubjectId !== subjectId) {
      setSubjectId(contextSubjectId);
      localStorage.setItem("subjectId", contextSubjectId);
    }
  }, [contextSubjectId, subjectId]);

  // Fetch quizzes when identifiers change
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (universityId && courseId && semesterId && subjectId && unitId) {
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
  }, [universityId, courseId, semesterId, subjectId, unitId]);

  const handleQuizChange = async (e) => {
    const quizId = e.target.value;
    setSelectedQuizId(quizId);
    if (quizId) {
      try {
        const quizDocRef = doc(
          db,
          `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
          quizId
        );
        const quizDoc = await getDoc(quizDocRef);
        if (quizDoc.exists()) {
          setQuizTitle(quizDoc.data().quizTitle || "");
          setQuestions(quizDoc.data().questions || []);
        }
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    } else {
      setQuizTitle("");
      setQuestions([
        {
          question: "",
          options: ["", "", "", ""],
          correctOption: "",
          explanation: "",
          isVisible: false,
        },
      ]);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctOption: "",
        explanation: "",
        isVisible: false,
      },
    ]);
  };

  const handleCreateNewQuiz = async () => {
    if (!inputQuizNumber) {
      toast.error("Please enter a quiz number.");
      return;
    }

    try {
      const quizDocRef = doc(
        db,
        `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
        inputQuizNumber
      );

      const quizDoc = await getDoc(quizDocRef);
      if (quizDoc.exists()) {
        toast.error("Quiz number already exists.");
        return;
      }

      await setDoc(quizDocRef, {
        universityId,
        semesterId,
        courseId,
        subjectId,
        unitId,
        quizTitle,
        questions: [],
        quizNumber: inputQuizNumber,
        responseSheet: [],
        createdBy: currentUserId,
        createdAt: new Date(),
      });

      setQuizOptions((prevOptions) => [
        ...prevOptions,
        { id: inputQuizNumber, quizTitle: "" },
      ]);
      setNewQuizNumber(inputQuizNumber);
      setSelectedQuizId(inputQuizNumber);
      setInputQuizNumber("");

      toast.success("New quiz number added successfully.");
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !universityId ||
      !semesterId ||
      !courseId ||
      !subjectId ||
      !unitId ||
      !quizTitle
    ) {
      setLoading(false);
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const quizNumber = inputQuizNumber || newQuizNumber || selectedQuizId;
      if (!quizNumber) {
        setLoading(false);
        toast.error("Quiz number is missing.");
        return;
      }

      const quizData = {
        quizTitle,
        questions,
        quizNumber,
        createdBy: currentUserId,
        universityId,
        semesterId,
        courseId,
        subjectId,
        unitId,
        responseSheet: [],
        createdAt: new Date(),
      };

      const quizDocRef = doc(
        db,
        `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
        quizNumber
      );

      await setDoc(quizDocRef, quizData);

      setLoading(false);
      toast.success("Quiz saved successfully!");

      setQuestions([
        {
          question: "",
          options: ["", "", "", ""],
          correctOption: "",
          explanation: "",
          isVisible: false,
        },
      ]);
      setQuizTitle("");
      setSelectedQuizId("");
    } catch (error) {
      console.error("Error saving quiz:", error);
      setLoading(false);
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuiz = async (quizId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete quiz ${quizId}?`
    );

    if (confirmDelete) {
      try {
        // Reference to the quiz document in the main collection
        const quizDocRefSSC = doc(
          db,
          `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
          quizId
        );

        // Reference to the quiz document in QUIZ_USERS collection
        const userQuizDocRef = doc(
          db,
          `QUIZ_USERS/${currentUserId}/quizzes`,
          quizId
        );

        // Delete quiz from both collections concurrently
        await Promise.all([
          deleteDoc(quizDocRefSSC),
          deleteDoc(userQuizDocRef),
        ]);

        // Update the state to remove the deleted quiz from the list
        setQuizOptions((prevOptions) =>
          prevOptions.filter((quiz) => quiz.id !== quizId)
        );

        // Reset the selected quiz if it was deleted
        if (selectedQuizId === quizId) {
          setSelectedQuizId("");
          setQuizTitle("");
          setQuestions([
            {
              question: "",
              options: ["", "", "", ""],
              correctOption: "",
              explanation: "",
              isVisible: false,
            },
          ]);
        }

        // Show success message
        toast.success(`Quiz ${quizId} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("Failed to delete quiz. Please try again.");
      }
    }
  };

  const toggleQuestionVisibility = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].isVisible = !updatedQuestions[index].isVisible;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = async () => {
    if (questionToDelete !== null && questionToDelete >= 0) {
      try {
        // Filter out the question to delete
        const updatedQuestions = questions.filter(
          (_, index) => index !== questionToDelete
        );

        // Ensure `selectedQuizId` or `newQuizNumber` is set correctly
        const quizId = selectedQuizId || newQuizNumber;

        if (!quizId) {
          toast.error("Quiz ID is missing. Please try again.");
          return;
        }

        // Reference to the quiz document in Firestore
        const quizDocRef = doc(
          db,
          `DEGREE_QUIZ/${universityId}/courses/${courseId}/semesters/${semesterId}/subjects/${subjectId}/units/${unitId}/quizzes`,
          quizId
        );

        // Update the Firestore document with the new questions array
        await updateDoc(quizDocRef, { questions: updatedQuestions });

        // Update local state
        setQuestions(updatedQuestions);

        // Notify user of success
        toast.success("Question deleted successfully!");
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question. Please try again.");
      }
      // Close the delete dialog
      setIsDeleteDialogOpen(false);
    } else {
      toast.error("Invalid question index. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mt-10 mx-auto p-8 bg-white text-black shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Add or Edit Quiz for Unit {unitId}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Enter Quiz Number
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputQuizNumber}
              onChange={(e) => setInputQuizNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter new quiz number"
            />
            <button
              type="button"
              onClick={handleCreateNewQuiz}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Create New Quiz
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={handleQuizChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a Quiz</option>
            {quizOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter quiz title"
          />
        </div>

        {questions.map((q, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Question {index + 1}</h2>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => toggleQuestionVisibility(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  {q.isVisible ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionToDelete(index);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
            {q.isVisible && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(index, "question", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter the question"
                />
                <label className="block text-gray-700 font-semibold mt-4 mb-2">
                  Options
                </label>
                {q.options.map((opt, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleQuestionChange(index, "options", [
                        ...q.options.slice(0, optIndex),
                        e.target.value,
                        ...q.options.slice(optIndex + 1),
                      ])
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:border-blue-500"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                ))}
                <label className="block text-gray-700 font-semibold mt-4 mb-2">
                  Correct Option
                </label>
                <input
                  type="text"
                  value={q.correctOption}
                  onChange={(e) =>
                    handleQuestionChange(index, "correctOption", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter correct option"
                />
                <label className="block text-gray-700 font-semibold mt-4 mb-2">
                  Explanation
                </label>
                <textarea
                  value={q.explanation}
                  onChange={(e) =>
                    handleQuestionChange(index, "explanation", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter explanation"
                  rows="4"
                />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Add Question
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`bg-green-500 text-white px-4 py-2 rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Save Quiz"}
        </button>
      </form>

      <Toaster />

      {/* Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-lg font-semibold">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-600">
              Are you sure you want to delete this question? This action cannot
              be undone.
            </Dialog.Description>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Table to display quizzes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Existing Quizzes</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Quiz Number</th>
              <th className="px-4 py-2 border">No. of Questions</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizOptions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-600">
                  No quizzes available
                </td>
              </tr>
            ) : (
              quizOptions.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="px-4 py-2 border text-center">{quiz.id}</td>
                  <td className="px-4 py-2 border text-center">
                    {quiz.questions?.length || 0}{" "}
                    {/* Display number of questions */}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
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

export default DegreeQuiz;
