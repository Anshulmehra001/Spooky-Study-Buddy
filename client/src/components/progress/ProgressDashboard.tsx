import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Ghost } from '../characters/Ghost';
import { Witch } from '../characters/Witch';

export const ProgressDashboard: React.FC = () => {
  const [storiesCount, setStoriesCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const stories = JSON.parse(localStorage.getItem('spooky_stories') || '[]');
    const quizResults = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    
    setStoriesCount(stories.length);
    setQuizzesCount(quizResults.length);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="text-center">
        <h1 className="text-4xl font-creepster text-spooky-orange mb-4">
          📊 Your Spooky Progress
        </h1>
        <p className="text-spooky-cream opacity-80">
          Track your learning journey through the haunted halls of knowledge!
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="text-center">
          <Ghost message="Stories Created!" />
          <div className="text-6xl font-bold text-spooky-orange mt-4">
            {storiesCount}
          </div>
          <p className="text-spooky-cream opacity-80 mt-2">
            Spooky Stories Generated
          </p>
        </Card>

        <Card className="text-center">
          <Witch message="Quizzes Taken!" />
          <div className="text-6xl font-bold text-spooky-purple mt-4">
            {quizzesCount}
          </div>
          <p className="text-spooky-cream opacity-80 mt-2">
            Knowledge Tests Completed
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-spooky-orange mb-4">
          🎃 Keep Learning!
        </h2>
        <p className="text-spooky-cream opacity-90">
          Upload more study materials to create spooky stories and test your knowledge with quizzes!
        </p>
        <div className="mt-4">
          <a
            href="/Spooky-Study-Buddy/"
            className="inline-block px-6 py-3 bg-spooky-orange text-white rounded-lg hover:bg-opacity-80 transition-all"
          >
            🏠 Back to Home
          </a>
        </div>
      </Card>
    </div>
  );
};
