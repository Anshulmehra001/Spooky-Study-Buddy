import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Ghost } from '../characters/Ghost';
import { Witch } from '../characters/Witch';
import { SpookyStory, QuizResult } from '../../../../shared/src/types';

export const ProgressDashboard: React.FC = () => {
  const [storiesCount, setStoriesCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [perfectScores, setPerfectScores] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const stories: SpookyStory[] = JSON.parse(localStorage.getItem('spooky_stories') || '[]');
    const quizResults: QuizResult[] = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    
    setStoriesCount(stories.length);
    setQuizzesCount(quizResults.length);
    
    if (quizResults.length > 0) {
      const avgScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length;
      const time = quizResults.reduce((sum, r) => sum + r.timeSpent, 0);
      const perfect = quizResults.filter(r => r.score === 100).length;
      
      setAverageScore(Math.round(avgScore));
      setTotalTime(time);
      setPerfectScores(perfect);
    }
  };

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

      {quizzesCount > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-3xl font-bold text-spooky-orange">
              {averageScore}%
            </div>
            <p className="text-spooky-cream opacity-80 text-sm">
              Average Score
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-spooky-purple">
              {Math.floor(totalTime / 60)}m
            </div>
            <p className="text-spooky-cream opacity-80 text-sm">
              Total Study Time
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-spooky-orange">
              {perfectScores}
            </div>
            <p className="text-spooky-cream opacity-80 text-sm">
              Perfect Scores
            </p>
          </Card>
        </div>
      )}

      <Card className="text-center">
        <h2 className="text-2xl font-bold text-spooky-orange mb-4">
          🎃 Keep Learning!
        </h2>
        <p className="text-spooky-cream opacity-90 mb-6">
          Upload more study materials to create spooky stories and test your knowledge with quizzes!
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-spooky-orange text-white rounded-lg hover:bg-opacity-80 transition-all"
          >
            🏠 Back to Home
          </Link>
          <button
            onClick={loadProgress}
            className="inline-block px-6 py-3 bg-spooky-purple text-white rounded-lg hover:bg-opacity-80 transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </Card>
    </div>
  );
};
