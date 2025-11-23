import { SpookyStory, Quiz, QuizQuestion, HalloweenCharacterType } from '../../../shared/src/types';

const HALLOWEEN_CHARACTERS: HalloweenCharacterType[] = ['ghost', 'vampire', 'witch', 'skeleton'];

export class LocalStoryGenerator {
  async generateStory(content: string, fileName?: string): Promise<SpookyStory> {
    const provider = localStorage.getItem('ai_provider') || 'none';
    const apiKey = localStorage.getItem('ai_api_key');

    if (provider !== 'none' && apiKey) {
      try {
        return await this.generateAIStory(content, fileName, provider as 'openai' | 'gemini', apiKey);
      } catch (error) {
        console.error('AI generation failed, falling back to template:', error);
      }
    }

    return this.generateTemplateStory(content, fileName);
  }

  private async generateAIStory(
    content: string,
    fileName: string | undefined,
    provider: 'openai' | 'gemini',
    apiKey: string
  ): Promise<SpookyStory> {
    const topic = this.extractTopic(content, fileName);
    const prompt = `Transform this educational content into an engaging Halloween-themed story. Keep ALL the educational content intact but wrap it in a spooky narrative with Halloween characters (ghosts, vampires, witches, skeletons). Make it fun but preserve the learning material.

Educational Content:
${content.substring(0, 1500)}

Create a story that:
1. Starts with a Halloween character introducing the topic
2. Includes ALL the original educational content
3. Ends with a spooky conclusion
4. Is engaging and memorable`;

    let storyContent: string;

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        const data = await response.json();
        storyContent = data.choices[0].message.content;
      } else {
        // Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }
        const data = await response.json();
        storyContent = data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.error(`${provider} API error:`, error);
      throw error;
    }

    const characters = this.selectRandomCharacters(2);
    
    return {
      id: `story-${Date.now()}`,
      title: `🎃 AI-Generated: ${topic}`,
      content: storyContent,
      originalContent: content,
      originalTopic: topic,
      characters: characters.map(c => c.type),
      keyLearningPoints: this.extractKeyPoints(content),
      difficulty: 'intermediate',
      estimatedReadTime: Math.ceil(content.split(' ').length / 200),
      createdAt: new Date().toISOString()
    };
  }

  private generateTemplateStory(content: string, fileName?: string): SpookyStory {
    const characters = this.selectRandomCharacters(2);
    const topic = this.extractTopic(content, fileName);
    
    const storyContent = this.wrapContentInStory(content, characters, topic);
    
    return {
      id: `story-${Date.now()}`,
      title: `🎃 ${characters[0].name}'s Guide to ${topic}`,
      content: storyContent,
      originalContent: content,
      originalTopic: topic,
      characters: characters.map(c => c.type),
      keyLearningPoints: this.extractKeyPoints(content),
      difficulty: 'intermediate',
      estimatedReadTime: Math.ceil(content.split(' ').length / 200),
      createdAt: new Date().toISOString()
    };
  }

  generateQuiz(story: SpookyStory): Quiz {
    const sentences = (story.originalContent || story.content)
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 200);
    
    const questions: QuizQuestion[] = [];
    const questionCount = 5;
    
    for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
      const sentence = sentences[i];
      const words = sentence.split(' ').filter(w => w.length > 4);
      const keyTerm = words[Math.floor(Math.random() * Math.min(3, words.length))];
      
      const questionText = sentence.replace(keyTerm, '______');
      const wrongAnswers = this.generateWrongAnswers(keyTerm, words);
      const allOptions = [keyTerm, ...wrongAnswers].slice(0, 4);
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      
      questions.push({
        id: `q${i + 1}`,
        question: `Complete the statement: ${questionText}`,
        options: shuffled,
        correctAnswer: shuffled.indexOf(keyTerm),
        explanation: `The correct answer is "${keyTerm}". From: "${sentence}"`,
        character: HALLOWEEN_CHARACTERS[i % HALLOWEEN_CHARACTERS.length]
      });
    }
    
    return {
      id: `quiz-${Date.now()}`,
      storyId: story.id,
      questions,
      totalPoints: questions.length * 10,
      difficulty: 'medium',
      timeLimit: questions.length * 90,
      createdAt: new Date().toISOString()
    };
  }

  private selectRandomCharacters(count: number) {
    const characters = [
      { type: 'ghost' as const, name: 'Professor Ghostly' },
      { type: 'vampire' as const, name: 'Count Knowledge' },
      { type: 'witch' as const, name: 'Professor Mystique' },
      { type: 'skeleton' as const, name: 'Dr. Bones' }
    ];
    
    return characters.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private extractTopic(content: string, fileName?: string): string {
    if (fileName) {
      return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }
    
    const words = content.split(' ').slice(0, 10).join(' ');
    return words.length > 50 ? words.substring(0, 50) + '...' : words;
  }

  private wrapContentInStory(content: string, characters: any[], topic: string): string {
    const opening = `🎃 Welcome, brave student! 🎃

I am ${characters[0].name}, and I shall guide you through the mysterious realm of ${topic}!

*The ancient tome glows with an eerie light as the lesson begins...*

---

📚 The Ancient Knowledge Revealed 📚

${content}

---

✨ The Lesson Learned ✨

And thus concludes our spooky journey through ${topic}! Remember these teachings well, for they shall serve you in your academic adventures!

*${characters[0].name} fades into the mist, leaving you with newfound knowledge...*

🎃 Stay spooky and keep learning! 👻`;

    return opening;
  }

  private extractKeyPoints(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 150)
      .slice(0, 5);
  }

  private generateWrongAnswers(correctAnswer: string, contextWords: string[]): string[] {
    const wrongAnswers: string[] = [];
    const candidates = contextWords.filter(w => 
      w !== correctAnswer && w.length > 3
    );
    
    wrongAnswers.push(...candidates.slice(0, 2));
    
    const generic = ['Halloween', 'Spooky', 'Mystery', 'Magic'];
    while (wrongAnswers.length < 3) {
      const random = generic[Math.floor(Math.random() * generic.length)];
      if (!wrongAnswers.includes(random)) wrongAnswers.push(random);
    }
    
    return wrongAnswers.slice(0, 3);
  }
}

export const localStoryGenerator = new LocalStoryGenerator();
