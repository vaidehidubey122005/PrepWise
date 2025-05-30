import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { ReactMediaRecorder } from "react-media-recorder";

const questions = [
  "Tell me about yourself.",
  "Why do you want this job?",
  "What are your strengths?",
  "Describe a challenge you’ve faced.",
  "Where do you see yourself in 5 years?",
];

const Interview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // refs to control recording externally
  const startRecordingRef = useRef(null);
  const stopRecordingRef = useRef(null);

  useEffect(() => {
    let timer;
    if (hasStarted && isRecording) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        // Auto stop recording when timer hits 0
        handleStopRecording();
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isRecording, hasStarted]);

  const handleStartInterview = () => {
    setHasStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(60);
    setFeedback(null);
  };

  const handleStartRecording = () => {
    if (startRecordingRef.current) {
      startRecordingRef.current();
    }
    setIsRecording(true);
    setTimeLeft(60);
  };

  const handleStopRecording = () => {
    if (stopRecordingRef.current) {
      stopRecordingRef.current();
    }
    setIsRecording(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
    } else {
      setHasStarted(false);
      setFeedback("Interview complete! AI Feedback: Well done.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Interview Room</h1>

      {!hasStarted ? (
        <>
          <p className="text-lg text-center mb-6 max-w-xl">
            Welcome! When you click "Start Interview", you will be asked 5 questions. 
            Each question has a 1-minute timer. Your responses will be recorded via audio.
          </p>
          <button
            onClick={handleStartInterview}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Start Interview
          </button>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
          {/* Instructions */}
          <div className="p-6 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Question {currentQuestion + 1}</h2>
            <p className="mb-4 text-gray-700">{questions[currentQuestion]}</p>
            <p className="text-sm text-gray-500">Time left: {timeLeft}s</p>
          </div>

          {/* Webcam and Recorder */}
          <div className="p-6 bg-white shadow-xl rounded-xl flex flex-col items-center">
            <Webcam className="w-full max-w-md rounded-xl mb-4" />
            <ReactMediaRecorder
              audio
              render={({ status, startRecording, stopRecording }) => {
                startRecordingRef.current = startRecording;
                stopRecordingRef.current = stopRecording;
                return (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-600">Audio status: {status}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleStartRecording}
                        disabled={isRecording}
                        className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                          isRecording ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Start Recording
                      </button>
                      <button
                        onClick={handleStopRecording}
                        disabled={!isRecording}
                        className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${
                          !isRecording ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Stop Recording
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      )}

      {feedback && (
        <div className="mt-8 p-6 bg-green-100 border-l-4 border-green-600 text-green-800 rounded-xl w-full max-w-xl text-center">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default Interview;
