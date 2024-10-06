"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/FirebaseConfig";
import { FiSearch } from "react-icons/fi"; // Search icon

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [quizzes, setQuizzes] = useState([]); // To hold quiz data
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions based on the search term
  const fetchSuggestions = async (term) => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        orderBy("username"),
        startAt(term),
        endAt(term + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      const fetchedSuggestions = querySnapshot.docs.map((doc) => doc.data());
      setSuggestions(fetchedSuggestions);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Search for user details and quizzes on clicking a suggestion
  const handleSearch = async (term) => {
    setLoading(true);
    setError(null);
    setUserDetails(null);
    setQuizzes([]); // Reset quizzes

    try {
      const q = query(collection(db, "users"), where("username", "==", term));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const qByEmail = query(
          collection(db, "users"),
          where("email", "==", term)
        );
        const emailSnapshot = await getDocs(qByEmail);

        if (!emailSnapshot.empty) {
          const user = emailSnapshot.docs[0].data();
          console.log("sdfdsf", user);
          setUserDetails(user);
          await fetchUserQuizzes(user.uid); // Fetch quizzes for found user
        } else {
          setError("No user found");
        }
      } else {
        const user = querySnapshot.docs[0].data();
        setUserDetails(user);
        await fetchUserQuizzes(user.uid); // Fetch quizzes for found user
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Error fetching user");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes for the given user ID
  const fetchUserQuizzes = async (userId) => {
    try {
      const quizzesRef = collection(db, `QUIZ_USERS/${userId}/quizzes`);
      const quizzesSnapshot = await getDocs(quizzesRef);

      const fetchedQuizzes = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuizzes(fetchedQuizzes);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Error fetching quizzes");
    }
  };

  // Trigger suggestions when typing
  useEffect(() => {
    fetchSuggestions(searchTerm);
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center text-black justify-center">
        {/* Search input with icon */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Username or Email"
            className="border border-gray-300 p-3 pl-10 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <FiSearch className="absolute top-3 left-3 text-gray-500" size={20} />

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 mt-1 w-full max-h-60 overflow-auto rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion.username || suggestion.email);
                    handleSearch(suggestion.username || suggestion.email);
                    setSuggestions([]); // Clear suggestions on select
                  }}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                >
                  {suggestion.username || suggestion.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => handleSearch(searchTerm)}
          className="bg-blue-600 text-white p-3 rounded-md ml-4 hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader border-t-4 border-blue-600 w-8 h-8 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Show user details if found */}
      {userDetails && !loading && (
        <div className="mt-4 p-4 border rounded-md bg-white text-black shadow-md max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">User Details:</h3>
          <p>
            <strong>Username:</strong> {userDetails.username}
          </p>
          <p>
            <strong>Email:</strong> {userDetails.email}
          </p>
          <p>
            <strong>Gender:</strong> {userDetails.gender}
          </p>
          <p>
            <strong>Phone Number:</strong> {userDetails.phoneNumber}
          </p>
          {userDetails.photoURL && (
            <img
              src={userDetails.photoURL}
              alt="Profile"
              className="mt-2 rounded-full w-24 h-24 object-cover"
            />
          )}

          {/* Show quizzes associated with the user */}
          {quizzes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Quizzes:</h4>
              <ul className="list-disc list-inside">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="mb-2">
                    <strong>Quiz Title:</strong> {quiz.quizTitle || "N/A"}
                    {/* Show questions if needed */}
                    {quiz.questions && quiz.questions.length > 0 && (
                      <div className="mt-2">
                        <strong>Questions:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {quiz.questions.map((question, index) => (
                            <li key={index}>
                              {question.question}
                              <p>
                                <strong>Options:</strong>{" "}
                                {question.options.join(", ")}
                              </p>
                              <p>
                                <strong>Correct Option:</strong>{" "}
                                {question.correctOption}
                              </p>
                              <p>
                                <strong>Explanation:</strong>{" "}
                                {question.explanation || "N/A"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Show error message if no user found or error occurred */}
      {error && !loading && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default UserSearch;
