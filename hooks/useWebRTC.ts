"use client"
import { useCallback, useEffect, useRef, useState } from 'react';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface UseWebRTCProps {
  roomId: string;
  isInitiator?: boolean;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export const useWebRTC = ({
  roomId,
  isInitiator = false,
  onRemoteStream,
  onConnectionStateChange
}: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // Initialize WebSocket connection for signaling
  const initializeSignaling = useCallback(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?room=${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await handleSignalingMessage(message);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [roomId]);

  // Handle signaling messages
  const handleSignalingMessage = async (message: any) => {
    if (!peerConnectionRef.current) return;

    switch (message.type) {
      case 'offer':
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.data));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        sendSignalingMessage({ type: 'answer', data: answer });
        break;

      case 'answer':
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.data));
        break;

      case 'ice-candidate':
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.data));
        break;
    }
  };

  // Send signaling message
  const sendSignalingMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    // Handle remote stream
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      onRemoteStream?.(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({ type: 'ice-candidate', data: event.candidate });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionState(state);
      setIsConnected(state === 'connected');
      onConnectionStateChange?.(state);
    };

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  }, [localStream, config, onRemoteStream, onConnectionStateChange]);

  // Start local media (camera and microphone)
  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true
      });
      
      // Replace video track in peer connection
      if (peerConnectionRef.current && localStream) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
      
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [localStream]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (localStream && peerConnectionRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setIsScreenSharing(false);
    }
  }, [localStream]);

  // Create and send offer (for initiator)
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      sendSignalingMessage({ type: 'offer', data: offer });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  // End call
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsScreenSharing(false);
  }, [localStream]);

  // Initialize everything
  useEffect(() => {
    initializeSignaling();
    
    return () => {
      endCall();
    };
  }, [roomId]);

  // Initialize peer connection when local stream is available
  useEffect(() => {
    if (localStream) {
      const pc = initializePeerConnection();
      
      if (isInitiator) {
        createOffer();
      }
    }
  }, [localStream, isInitiator, initializePeerConnection, createOffer]);

  return {
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
  };
};
