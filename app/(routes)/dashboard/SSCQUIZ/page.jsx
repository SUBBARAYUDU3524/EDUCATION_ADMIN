"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/app/FirebaseConfig";
import ItemContext from "@/app/ItemContext";
import { Toaster, toast } from "react-hot-toast";
import { Dialog } from "@headlessui/react"; // Dialog component for the modal
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";

const SSCQuiz = () => {
  const [quizzesData, setQuizzesData] = useState([]);
  const [quizTimer, setQuizTimer] = useState(10); // 10 minutes for the quiz
  const [marks, setMarks] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for scorecard dialog
  const [isUnansweredDialogOpen, setIsUnansweredDialogOpen] = useState(false); // State for unanswered questions dialog
  const [unansweredQuestions, setUnansweredQuestions] = useState([]); // Track unanswered questions
  const [showResponseSheet, setShowResponseSheet] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const timerIdRef = useRef(null);
  // For toggling the response sheet

  const { subjectId, unitId, classId, indexx } = useContext(ItemContext);

  // Fetch quizzes data in real-time from Firestore
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

            const fetchedQuizzes = quizzes.map((quiz) => ({
              quizId: quiz.id,
              quizNumber: quiz.quizTitle,
              questions: quiz.questions || [],
            }));

            setQuizzesData(fetchedQuizzes);
            setSelectedAnswers(
              new Array(fetchedQuizzes[indexx]?.questions.length).fill(null)
            );
          } else {
            console.error("No quiz data found in Firestore!");
            toast.error("No quiz data found!");
            setQuizzesData([]);
          }
        },
        (error) => {
          console.error("Error fetching quiz data:", error);
          toast.error("Error fetching quiz data!");
        }
      );
      return () => unsubscribe();
    }
  }, [classId, subjectId, unitId]);

  console.log(quizzesData);

  // Timer logic for the quiz

  useEffect(() => {
    if (quizTimer > 0) {
      const timerId = setInterval(() => setQuizTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timerId); // Clear interval on unmount or when the timer stops
    } else {
      submitQuiz();
    }
  }, [quizTimer]);

  const handleOptionClick = (index, option) => {
    if (!isSubmitted) {
      const updatedAnswers = [...selectedAnswers];
      updatedAnswers[index] = option;
      setSelectedAnswers(updatedAnswers);
    }
  };

  // Handle form submission with unanswered question check
  const handleSubmit = () => {
    clearInterval(timerIdRef.current); // Stop the interval
    setQuizTimer(0); // Set timer to 00:00

    // Check for unanswered questions
    const unanswered = [];
    quizzesData[indexx]?.questions.forEach((_, index) => {
      if (selectedAnswers[index] === null) {
        unanswered.push(index + 1); // Question numbers are 1-based
      }

      setShowTimeUpDialog(false);
    });

    if (unanswered.length > 0) {
      // If there are unanswered questions, show the confirmation dialog
      setUnansweredQuestions(unanswered);
      setIsUnansweredDialogOpen(true);
    } else {
      // Proceed with submission if all questions are answered
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitted(true);
    setIsDialogOpen(true); // Open the dialog box after submitting

    // Calculate marks and other details
    let calculatedMarks = 0;
    const totalQuestions = quizzesData[indexx]?.questions.length;

    // Ensure quizzesData[indexx] exists
    if (!quizzesData[indexx]) {
      console.error("Selected quiz data is undefined.");
      return; // Early return if no quiz data is available
    }

    const correctAnswers = quizzesData[indexx]?.questions.filter(
      (question, index) => selectedAnswers[index] === question.correctOption
    ).length;

    const wrongAnswers = totalQuestions - correctAnswers; // Calculate wrong answers
    calculatedMarks = correctAnswers; // Marks equal to the number of correct answers
    const percentage = ((calculatedMarks / totalQuestions) * 100).toFixed(2); // Calculate percentage
    setMarks(calculatedMarks);

    // Prepare the response data
    const responseData = {
      quizId: quizzesData[indexx]?.quizId, // Assuming quiz ID is stored here
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      marks: calculatedMarks,
      percentage,
      questions: quizzesData[indexx]?.questions, // Store all questions too
    };

    // Log response data for debugging
    console.log("Response Data:", responseData);

    // Store in Firestore
    try {
      const quizRef = doc(
        collection(
          db,
          `SSC_QUIZ/${classId}/subjects/${subjectId}/units/${unitId}/responses`
        )
      );

      // Check if quizId is defined
      if (!responseData.quizId) {
        console.error("Quiz ID is undefined.");
        return; // Early return if quizId is not available
      }

      // Set the response data to a new document
      await setDoc(quizRef, responseData);

      console.log("Quiz details saved successfully", responseData);

      // Now update the responseSheet in QUIZ_USERS collection
      if (auth.currentUser) {
        const userId = auth.currentUser.uid; // Get the user ID
        const userDocRef = doc(db, "QUIZ_USERS", userId); // Reference to the user document

        // Fetch the current user document to update responseSheet
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Prepare the updated responseSheet
          const updatedResponseSheet = [
            ...(userData?.responseSheet || []), // Spread existing responses or start with an empty array
            responseData, // Add the new response data
          ];

          // Update the user's responseSheet directly
          await updateDoc(userDocRef, {
            responseSheet: updatedResponseSheet, // Update the responseSheet field directly
          });

          console.log(
            "Response sheet updated successfully:",
            updatedResponseSheet
          );
        } else {
          console.warn("User document does not exist. Creating a new one.");

          // If the user document does not exist, create it
          const newUserData = {
            responseSheet: [responseData], // Initialize with the first response
          };

          // Create the user document
          await setDoc(userDocRef, newUserData);

          console.log(
            "New user document created with response data:",
            newUserData
          );
        }
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error(
        "Error saving quiz details or updating response sheet:",
        error
      );
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizzesData[indexx]?.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleResponseSheet = () => {
    setShowResponseSheet(true); // Show the response sheet
    setIsDialogOpen(false); // Close the dialog box
  };

  const handleClose = () => {
    setIsDialogOpen(false); // Close the dialog box
    setShowResponseSheet(false); // Reset the response sheet view
  };

  const handleUnansweredCancel = () => {
    setIsUnansweredDialogOpen(false);
  };

  const handleUnansweredSubmit = () => {
    setIsUnansweredDialogOpen(false);
    submitQuiz(); // Proceed with quiz submission despite unanswered questions
  };

  if (!classId || !subjectId || !unitId) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500">Missing classId, subjectId, or unitId!</p>
      </div>
    );
  }

  return (
    <div className="quiz-container max-w-4xl mx-auto p-6 bg-white text-black rounded-lg shadow-lg flex">
      {/* Quiz Section */}
      <div className="quiz-section w-3/4 pr-6">
        <div className="text-center mb-4">
          <span className="text-xl font-bold">
            Time Remaining: {Math.floor(quizTimer / 60)}:
            {quizTimer % 60 < 10 ? `0${quizTimer % 60}` : quizTimer % 60}
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">SSC Quiz</h2>
        {quizzesData.length > 0 && quizzesData[indexx]?.questions.length > 0 ? (
          <div className="quiz-content">
            {!showResponseSheet ? (
              <div className="mb-6">
                <h3 className="text-2xl font-semibold">
                  Question {currentQuestionIndex + 1}:{" "}
                  {
                    quizzesData[indexx]?.questions[currentQuestionIndex]
                      ?.question
                  }
                </h3>
                <ul className="mt-4">
                  {quizzesData[indexx]?.questions[
                    currentQuestionIndex
                  ]?.options.map((option, optionIndex) => (
                    <li
                      key={optionIndex}
                      onClick={() =>
                        handleOptionClick(currentQuestionIndex, option)
                      }
                      className={`option p-4 my-2 cursor-pointer rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === option
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="response-sheet">
                {quizzesData[indexx]?.questions.map((question, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-2xl font-semibold">
                      Question {index + 1}: {question.question}
                    </h3>
                    <ul className="mt-4">
                      {question.options.map((option, optionIndex) => (
                        <li
                          key={optionIndex}
                          className={`option p-4 my-2 rounded-lg transition-colors ${
                            option === question.correctOption
                              ? "bg-green-500 text-white"
                              : selectedAnswers[index] === option
                              ? "bg-red-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                    <div className="text-gray-500 mt-2">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              {!showResponseSheet && (
                <>
                  <button
                    onClick={handlePreviousQuestion}
                    className={`bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors ${
                      currentQuestionIndex === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors ${
                      currentQuestionIndex ===
                      quizzesData[indexx]?.questions.length - 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      currentQuestionIndex ===
                      quizzesData[indexx]?.questions.length - 1
                    }
                  >
                    Next
                  </button>
                </>
              )}

              {!showResponseSheet && (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No quiz data available. Please try again later.</p>
          </div>
        )}
      </div>

      {/* Question Navigation Section */}
      <div className="question-navigation w-1/4 bg-gray-200 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Questions</h3>
        <ul className="grid grid-cols-3 gap-2">
          {quizzesData[indexx]?.questions.map((_, index) => (
            <li
              key={index}
              className={`p-2 text-center cursor-pointer rounded-lg border transition-colors ${
                currentQuestionIndex === index
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-300"
              }`}
              onClick={() => handleQuestionNavigation(index)}
            >
              {index + 1}
            </li>
          ))}
        </ul>
      </div>

      {/* Score Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white text-black  p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Quiz Result
            </Dialog.Title>
            <p className="mb-4">
              You scored <span className="font-bold">{marks}</span> out of{" "}
              {quizzesData[indexx]?.questions.length}.
            </p>
            <button
              onClick={handleResponseSheet}
              className="bg-blue-600 text-white py-2 px-4 justify-between rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Responses
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors mt-4"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Unanswered Questions Dialog */}
      <Dialog
        open={isUnansweredDialogOpen}
        onClose={handleUnansweredCancel}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Unanswered Questions
            </Dialog.Title>
            <p className="mb-4">
              You have unanswered questions: {unansweredQuestions.join(", ")}.
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleUnansweredSubmit}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {showTimeUpDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Time Up!</h2>
            <p className="mb-6">
              You have run out of time to complete the quiz.
            </p>
            <button
              onClick={() => {
                handleSubmit(); // Call the submit function
                setShowTimeUpDialog(false); // Set dialog visibility to false
              }}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default SSCQuiz;
