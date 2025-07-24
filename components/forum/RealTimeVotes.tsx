'use client';

import { useState, useEffect } from 'react';
import { pusherClient, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface RealTimeVotesProps {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  onVote: (type: 'upvote' | 'downvote') => void;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
}

export function RealTimeVotes({ 
  postId, 
  initialUpvotes, 
  initialDownvotes, 
  onVote, 
  userVote 
}: RealTimeVotesProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [animateUp, setAnimateUp] = useState(false);
  const [animateDown, setAnimateDown] = useState(false);

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(PUSHER_CHANNELS.FORUM_POST(postId));

    channel.bind(PUSHER_EVENTS.VOTE_UPDATED, (data: any) => {
      const prevUpvotes = upvotes;
      const prevDownvotes = downvotes;
      
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);

      // Animate changes
      if (data.upvotes > prevUpvotes) {
        setAnimateUp(true);
        setTimeout(() => setAnimateUp(false), 500);
      }
      if (data.downvotes > prevDownvotes) {
        setAnimateDown(true);
        setTimeout(() => setAnimateDown(false), 500);
      }
    });

    return () => {
      channel.unbind_all();
      if (pusherClient) {
        pusherClient.unsubscribe(PUSHER_CHANNELS.FORUM_POST(postId));
      }
    };
  }, [postId, upvotes, downvotes]);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onVote('upvote')}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${
          userVote === 'UPVOTE'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
        } ${animateUp ? 'scale-110' : ''}`}
      >
        <ArrowUpIcon className="w-4 h-4" />
        <span className={`text-sm font-medium ${animateUp ? 'text-blue-600' : ''}`}>
          {upvotes}
        </span>
      </button>

      <button
        onClick={() => onVote('downvote')}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${
          userVote === 'DOWNVOTE'
            ? 'bg-red-600 text-white'
            : 'text-gray-500 hover:text-red-700 hover:bg-red-50'
        } ${animateDown ? 'scale-110' : ''}`}
      >
        <ArrowDownIcon className="w-4 h-4" />
        <span className={`text-sm font-medium ${animateDown ? 'text-red-700 font-bold' : ''}`}>
          {downvotes}
        </span>
      </button>
    </div>
  );
} 