'use client';
import VideoChat from '@/components/VideoChat';
import { useParams } from 'next/navigation';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  if (!roomId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      <VideoChat roomId={roomId} />
    </div>
  );
} 