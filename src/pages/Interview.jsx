import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { ReactMediaRecorder } from 'react-media-recorder';

const questions = [
  'Tell me about yourself.',
  'What are your strengths and weaknesses?',
  'Why do you want this job?',
  'Describe a challenge you faced and how you handled it.',
  'Where do you see yourself in five years?'
];

const Interview = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [responses, setResponses] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState([]);

  useEffect(() => {
    if (currentQuestion < questions.length && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(60);
    } else if (currentQuestion === questions.length && timeLeft === 0) {
      setShowFeedback(true);
    }
  }, [timeLeft, currentQuestion]);

  const handleStopRecording = (blob) => {
    setAudioBlobs((prev) => [...prev, blob]);
  };

  return (
    <div className="flex flex-col md:flex-row p-6 min-h-screen bg-gray-100">
      <div className="md:w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Interview Instructions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Answer each question within 1 minute.</li>
          <li>Your audio will be recorded automatically.</li>
          <li>Try to stay calm and confident.</li>
          <li>Feedback will be shown at the end of the interview.</li>
        </ul>
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-pink-600">Question {currentQuestion + 1} of {questions.length}</h3>
          {currentQuestion < questions.length ? (
            <>
              <p className="text-lg mt-2">{questions[currentQuestion]}</p>
              <p className="mt-2 text-sm text-gray-500">Time left: {timeLeft} seconds</p>
            </>
          ) : (
            <p className="mt-2 text-lg text-green-600">Interview completed!</p>
          )}
        </div>
      </div>

      <div className="md:w-1/2 p-4 flex flex-col items-center justify-center">
        <Webcam audio={false} screenshotFormat="image/jpeg" className="rounded-xl shadow-md w-full max-w-md" />
        <div className="mt-4 w-full max-w-md">
          <ReactMediaRecorder
            audio
            onStop={(blobUrl, blob) => handleStopRecording(blob)}
            render={({ startRecording, stopRecording }) => (
              <div className="flex gap-4 mt-2">
                <button
                  onClick={startRecording}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Start Recording
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                  Stop Recording
                </button>
              </div>
            )}
          />
        </div>

        {showFeedback && (
          <div className="mt-6 bg-white p-4 rounded shadow-md">
            <h3 className="text-xl font-bold mb-2 text-green-700">AI Feedback</h3>
            <p className="text-gray-700">Thank you for completing the interview. Our AI is analyzing your responses...</p>
            {/* You can plug in your backend AI analysis here and display the results */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
