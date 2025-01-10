'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [showCopyLink, setShowCopyLink] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  const createRoom = () => {
    const newRoomId = uuidv4().substring(0, 6);
    setGeneratedRoomId(newRoomId);
    setShowCopyLink(true);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/room/${generatedRoomId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const joinGeneratedRoom = () => {
    router.push(`/room/${generatedRoomId}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-pink-500 mb-4">Welcome!</h1>
        <p className="text-2xl text-white mb-8">Start your meet experience</p>
      </div>

      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md">
        {!showJoinForm && !showCopyLink && (
          <div className="space-y-4">
            <button
              onClick={createRoom}
              className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors text-lg"
            >
              Create Room
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full border-2 border-pink-500 text-pink-500 py-3 rounded-lg hover:bg-pink-500 hover:text-white transition-colors text-lg"
            >
              Join Room
            </button>
          </div>
        )}

        {showCopyLink && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white mb-2">Room Code:</p>
              <p className="text-pink-500 text-2xl font-bold">{generatedRoomId}</p>
            </div>
            <button
              onClick={copyLink}
              className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Copy Invite Link
            </button>
            <button
              onClick={joinGeneratedRoom}
              className="w-full border-2 border-pink-500 text-pink-500 py-2 rounded-lg hover:bg-pink-500 hover:text-white transition-colors"
            >
              Join Room Now
            </button>
            <button
              onClick={() => setShowCopyLink(false)}
              className="w-full text-gray-400 py-2 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {showJoinForm && (
          <div className="space-y-4">
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room Code"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={6}
              />
              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Join
              </button>
            </form>
            <button
              onClick={() => setShowJoinForm(false)}
              className="w-full text-gray-400 py-2 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}