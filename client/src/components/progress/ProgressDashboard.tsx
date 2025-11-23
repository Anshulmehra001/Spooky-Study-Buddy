import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Ghost } from '../characters/Ghost';
import { Witch } from '../characters/Witch';
import { SpookyStory, QuizResult } from '../../../../shared/src/types';

export const ProgressDashboard: React.FC = () => {
  const [storiesCount, setStoriesCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [perfectScores, setPerfectScores] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProgress();
  }, [refreshKey]);

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
    } else {
      setAverageScore(0);
      setTotalTime(0);
      setPerfectScores(0);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
        <Card className="text-center min-h-[280px] flex flex-col justify-center p-8">
          <div className="mb-4">
            <Ghost message="Stories Created!" />
          </div>
          <div className="text-6xl font-bold text-spooky-orange mb-2 leading-tight">
            {storiesCount}
          </div>
          <p className="text-spooky-cream opacity-80 text-lg leading-relaxed">
            Spooky Stories Generated
          </p>
        </Card>

        <Card className="text-center min-h-[280px] flex flex-col justify-center p-8">
          <div className="mb-4">
            <Witch message="Quizzes Taken!" />
          </div>
          <div className="text-6xl font-bold text-spooky-purple mb-2 leading-tight">
            {quizzesCount}
          </div>
          <p className="text-spooky-cream opacity-80 text-lg leading-relaxed">
            Knowledge Tests Completed
          </p>
        </Card>
      </div>

      {quizzesCount > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center min-h-[200px] flex flex-col justify-center py-8 px-6">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-4xl font-bold text-spooky-orange mb-2 leading-tight">
              {averageScore}%
            </div>
            <p className="text-spooky-cream opacity-80 leading-relaxed">
              Average Score
            </p>
          </Card>

          <Card className="text-center min-h-[200px] flex flex-col justify-center py-8 px-6">
            <div className="text-5xl mb-3">⏱️</div>
            <div className="text-4xl font-bold text-spooky-purple mb-2 leading-tight">
              {Math.floor(totalTime / 60)}m
            </div>
            <p className="text-spooky-cream opacity-80 leading-relaxed">
              Total Study Time
            </p>
          </Card>

          <Card className="text-center min-h-[200px] flex flex-col justify-center py-8 px-6">
            <div className="text-5xl mb-3">⭐</div>
            <div className="text-4xl font-bold text-spooky-orange mb-2 leading-tight">
              {perfectScores}
            </div>
            <p className="text-spooky-cream opacity-80 leading-relaxed">
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
          <Link to="/">
            <Button variant="primary" size="lg">
              🏠 Back to Home
            </Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={handleRefresh}>
            🔄 Refresh
          </Button>
        </div>
      </Card>
    </div>
  );
};
