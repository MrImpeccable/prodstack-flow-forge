
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeedbackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/feedback')}
      className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white shadow-lg z-50"
      size="sm"
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Feedback
    </Button>
  );
};

export default FeedbackButton;
