"use client"
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Phone, 
  PhoneOff,
  Users,
  Clock,
  MessageSquare
} from 'lucide-react';

type InterviewQuestions = {
  question: string,
  answer: string
}

type InterviewData = {
  jobTitle: string | null,
  jobDescription: string | null,
  interviewQuestions: InterviewQuestions[],
  userId: string | null,
  _id: string
}

function StartInterview() {
  const { interviewId } = useParams();
  const convex = useConvex();
  const [interviewData, setInterviewData] = useState<InterviewData | undefined>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, message: string, sender: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');

  const {
    localStream,
    remoteStream,
    isConnected,
    connectionState,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    startLocalMedia,
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
    endCall
  } = useWebRTC({
    roomId: interviewId as string,
    isInitiator: true,
    onRemoteStream: (stream) => {
      console.log('Remote stream received:', stream);
    },
    onConnectionStateChange: (state) => {
      console.log('Connection state changed:', state);
    }
  });

  useEffect(() => {
    if (interviewId) GetInterviewQuestions();
  }, [interviewId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (interviewStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewStarted]);

  const GetInterviewQuestions = async () => {
    const result = await convex.query(api.Interview.GetInterviewQuestions, {
      //@ts-ignore
      interviewRecordId: interviewId
    });

    console.log("Raw result from Gemini:", result);

    let parsedQuestions: InterviewQuestions[] = [];

    if (result?.interviewQuestions) {
      try {
        const parsed = JSON.parse(result.interviewQuestions);
        parsedQuestions = parsed.questions ?? [];
        // Optional: log each question & answer
        parsedQuestions.forEach((qa: InterviewQuestions) => {
          console.log("Q:", qa.question);
          console.log("A:", qa.answer);
        });
      } catch (err) {
        console.error("Error parsing interviewQuestions:", err);
      }
    }

    setInterviewData({
      _id: result._id,
      jobTitle: result.jobTitle ?? null,
      jobDescription: result.jobDescription ?? null,
      userId: result.userId ?? null,
      interviewQuestions: parsedQuestions
    });
  }

  const startInterview = async () => {
    try {
      await startLocalMedia();
      setInterviewStarted(true);
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const handleAudioToggle = () => {
    toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleVideoToggle = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to start screen sharing. Please check permissions.');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        message: newMessage,
        sender: 'You',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!interviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{interviewData.jobTitle}</h3>
                <p className="text-gray-600 mb-4">{interviewData.jobDescription}</p>
                <Badge variant="outline" className="mb-4">
                  {interviewData.interviewQuestions.length} Questions
                </Badge>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Interview Guidelines:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet, well-lit environment</li>
                  <li>• Test your camera and microphone before starting</li>
                  <li>• The interview will be recorded for review</li>
                  <li>• You can share your screen during the interview</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={startInterview}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{interviewData.jobTitle}</h1>
          <Badge variant="secondary" className="bg-green-600">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(timeElapsed)}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            <Users className="w-3 h-3 mr-1" />
            {connectionState}
          </Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Remote Video */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0 h-full">
                <div className="relative h-full min-h-[300px] bg-black rounded-lg overflow-hidden">
                  {remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-400">Waiting for interviewer...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Local Video */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0 h-full">
                <div className="relative h-full min-h-[300px] bg-black rounded-lg overflow-hidden">
                  {localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-400">Your camera</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary">You</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Question */}
          {interviewData.interviewQuestions[currentQuestionIndex] && (
            <Card className="mt-4 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {interviewData.interviewQuestions.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  {interviewData.interviewQuestions[currentQuestionIndex].question}
                </p>
                <div className="flex space-x-2">
                  {currentQuestionIndex > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  {currentQuestionIndex < interviewData.interviewQuestions.length - 1 && (
                    <Button 
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-4">Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={handleAudioToggle}
                className="flex items-center space-x-2"
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
              </Button>
              
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={handleVideoToggle}
                className="flex items-center space-x-2"
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span>{isVideoEnabled ? 'Camera Off' : 'Camera On'}</span>
              </Button>
              
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                onClick={handleScreenShare}
                className="flex items-center space-x-2 col-span-2"
              >
                <Monitor className="w-4 h-4" />
                <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
              </Button>
              
              <Button
                variant="destructive"
                onClick={endCall}
                className="flex items-center space-x-2 col-span-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Interview</span>
              </Button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-center">No messages yet</p>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{msg.sender}</span>
                        <span className="text-xs text-gray-400">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview