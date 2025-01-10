"use client";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io, Socket } from "socket.io-client";

interface VideoStreamProps {
  roomId: string;
}

const VideoChat: React.FC<VideoStreamProps> = ({ roomId }) => {
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const socketRef = useRef<Socket | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [participantCount, setParticipantCount] = useState(1);
  const MAX_PARTICIPANTS = 8;

  useEffect(() => {
    if (participantCount > MAX_PARTICIPANTS) {
      alert("This room is full. Maximum 8 participants allowed.");
      window.location.href = '/';
    }
  }, [participantCount]);

  useEffect(() => {
    const init = async () => {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

      socketRef.current = io(socketUrl, {
        transports: ["websocket"],
        path: "/api/socketio",
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localStreamRef.current = stream;

        socketRef.current.emit("join-room", roomId);
        socketRef.current.on("user-connected", (userId: string) => {
          if (participantCount >= MAX_PARTICIPANTS) {
            console.log("Room is full");
            return;
          }
          setParticipantCount(prev => prev + 1);
          const peer = createPeer(userId, socketRef.current?.id || "", stream);
          peers[userId] = peer;
          setPeers({ ...peers });
        });

        socketRef.current.on("signal", ({ userId, signal }) => {
          if (peers[userId]) {
            peers[userId].signal(signal);
          } else {
            const peer = addPeer(userId, signal, stream);
            peers[userId] = peer;
            setPeers({ ...peers });
          }
        });

        socketRef.current.on("user-disconnected", (userId: string) => {
          if (peers[userId]) {
            peers[userId].destroy();
            const newPeers = { ...peers };
            delete newPeers[userId];
            setPeers(newPeers);
            setParticipantCount(prev => prev - 1);
          }
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      Object.values(peers).forEach((peer) => peer.destroy());
    };
  }, [roomId]);

  const createPeer = (userId: string, initiatorId: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current?.emit("signal", { userId, signal });
    });

    peer.on("stream", (remoteStream) => {
      setStreams((prev) => ({ ...prev, [userId]: remoteStream }));
    });

    return peer;
  };

  const addPeer = (userId: string, signal: any, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current?.emit("signal", { userId, signal });
    });

    peer.on("stream", (remoteStream) => {
      setStreams((prev) => ({ ...prev, [userId]: remoteStream }));
    });

    peer.signal(signal);
    return peer;
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg border-2 border-pink-500"
          />
          <div className="absolute bottom-2 left-2 bg-pink-500 px-2 py-1 rounded text-white text-sm">
            You
          </div>
        </div>
        {Object.entries(streams).map(([userId, stream]) => (
          <div key={userId} className="relative aspect-video">
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg border-2 border-pink-500"
              ref={el => {
                if (el) el.srcObject = stream;
              }}
            />
            <div className="absolute bottom-2 left-2 bg-pink-500 px-2 py-1 rounded text-white text-sm">
              Peer
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoChat; 