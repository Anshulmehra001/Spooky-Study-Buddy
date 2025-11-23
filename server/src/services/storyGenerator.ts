import OpenAI from 'openai';
import { SpookyStory, HalloweenCharacter } from '../types.js';

// Initialize OpenAI client (only if API key is available)
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized successfully');
  } else {
    console.warn('⚠️  OPENAI_API_KEY not found. Story generation will use fallback templates.');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error);
  console.warn('⚠️  Story generation will use fallback templates.');
}

// Halloween characters pool
const HALLOWEEN_CHARACTERS: HalloweenCharacter[] = [
  {
    name: 'Professor Ghostly',
    type: 'ghost',
    personality: 'Wise and encouraging, loves to help students learn',
    catchphrase: 'Boo-tiful learning awaits!'
  },
  {
    name: 'Madame Mystique',
    type: 'witch',
    personality: 'Mysterious but helpful, speaks in riddles about knowledge',
    catchphrase: 'Knowledge is the most powerful spell!'
  },
  {
    name: 'Count Studula',
    type: 'vampire',
    personality: 'Dramatic and theatrical, passionate about education',
    catchphrase: 'I vant to teach you something new!'
  },
  {
    name: 'Bonnie Bones',
    type: 'skeleton',
    personality: 'Cheerful and energetic despite being bones',
    catchphrase: 'Learning is in my bones!'
  }
];

export interface StoryGenerationOptions {
  content: string;
  fileName?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  maxLength?: number;
}

export class StoryGeneratorService {
  private selectRandomCharacters(count: number = 2): HalloweenCharacter[] {
    const shuffled = [...HALLOWEEN_CHARACTERS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private extractKeyLearningPoints(content: string): string[] {
    // Simple extraction of key points (can be enhanced with AI)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private generateStoryPrompt(content: string, characters: HalloweenCharacter[]): string {
    const characterDescriptions = characters.map(char => 
      `${char.name} (${char.type}): ${char.personality}. Says "${char.catchphrase}"`
    ).join('\n');

    return `Transform the following educational content into an engaging Halloween-themed story that helps students learn and remember the material. 

CHARACTERS TO INCLUDE:
${characterDescriptions}

REQUIREMENTS:
- Make it educational and memorable
- Keep the spooky theme fun, not scary
- Include the characters naturally in the story
- Maintain all important learning concepts
- Make it engaging for students aged 13-25
- Use a narrative structure with beginning, middle, and end
- Include dialogue from the characters using their catchphrases

ORIGINAL CONTENT:
${content}

Create a spooky story that teaches this material:`;
  }

  async generateSpookyStory(options: StoryGenerationOptions): Promise<SpookyStory> {
    const startTime = Date.now();
    
    try {
      // Select random characters for this story
      const characters = this.selectRandomCharacters();
      
      // If OpenAI is not available, use fallback immediately
      if (!openai) {
        console.log('Using fallback story generation (no OpenAI API key)');
        return this.generateFallbackStory(options);
      }
      
      // Generate story using OpenAI
      const prompt = this.generateStoryPrompt(options.content, characters);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing assistant that specializes in educational Halloween-themed stories. Create engaging, memorable stories that help students learn while having fun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxLength || 1500,
        temperature: 0.8,
      });

      const storyContent = completion.choices[0]?.message?.content || '';
      
      if (!storyContent) {
        throw new Error('Failed to generate story content');
      }

      // Extract learning points
      const keyLearningPoints = this.extractKeyLearningPoints(options.content);
      
      // Generate a spooky title
      const titleCompletion = await openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Create a short, catchy Halloween-themed title for this educational story. Include relevant emojis. Keep it under 60 characters:\n\n${storyContent.substring(0, 200)}...`
          }
        ],
        max_tokens: 50,
        temperature: 0.9,
      });

      const title = titleCompletion.choices[0]?.message?.content?.trim() || '🎃 A Spooky Learning Adventure';

      // Create the story object
      const story: SpookyStory = {
        id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content: storyContent,
        originalContent: options.content,
        originalTopic: options.fileName || 'Direct text input',
        characters: characters.map(char => char.name),
        keyLearningPoints,
        difficulty: options.difficulty || 'intermediate',
        estimatedReadTime: this.estimateReadingTime(storyContent),
        createdAt: new Date().toISOString(),
      };

      const processingTime = (Date.now() - startTime) / 1000;
      console.log(`Story generated in ${processingTime}s for topic: ${story.originalTopic}`);

      return story;

    } catch (error) {
      console.error('Error generating spooky story:', error);
      
      // Fallback to template-based story if AI fails
      return this.generateFallbackStory(options);
    }
  }

  private generateFallbackStory(options: StoryGenerationOptions): SpookyStory {
    const characters = this.selectRandomCharacters();
    const keyPoints = this.extractKeyLearningPoints(options.content);
    
    // Split content into paragraphs for better story structure
    const paragraphs = options.content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = options.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Create an engaging story that preserves ALL educational content
    let storyParts = [];
    
    // Opening
    storyParts.push(`🎃 **The Haunted Library of Knowledge** 🎃\n`);
    storyParts.push(`On a dark and stormy night, ${characters[0].name} the ${characters[0].type} discovered an ancient tome in the depths of the haunted library. The dusty pages glowed with an eerie light as they revealed secrets about ${options.fileName || 'an important subject'}.\n`);
    storyParts.push(`"${characters[0].catchphrase}" ${characters[0].name} exclaimed, their spectral form shimmering with excitement.\n`);
    
    // Main content - preserve ALL educational information
    storyParts.push(`\n📚 **The Ancient Knowledge Revealed** 📚\n`);
    storyParts.push(`${characters[1].name} the ${characters[1].type} appeared in a swirl of mist, ready to help decode the mysterious text:\n\n`);
    
    // Include the FULL original content, formatted nicely
    if (paragraphs.length > 1) {
      paragraphs.forEach((para, index) => {
        if (index > 0) storyParts.push(`\n`);
        storyParts.push(`${para.trim()}\n`);
      });
    } else {
      storyParts.push(`${options.content}\n`);
    }
    
    // Closing with learning reinforcement
    storyParts.push(`\n\n✨ **The Lesson Learned** ✨\n`);
    storyParts.push(`"${characters[1].catchphrase}" ${characters[1].name} said with a knowing smile. "Now you understand the mysteries within!"\n`);
    storyParts.push(`\nThe spooky characters had successfully transformed the lesson into an unforgettable adventure. The knowledge was no longer just words on a page - it was a story that would haunt your memory forever! 👻📖\n`);
    
    const fallbackContent = storyParts.join('');
    
    // Generate a topic-specific title
    const firstWords = options.content.substring(0, 50).trim();
    const topicHint = firstWords.split(' ').slice(0, 3).join(' ');
    const title = `🎃 ${characters[0].name}'s Guide to ${topicHint}... 👻`;

    return {
      id: `story-${Date.now()}-fallback`,
      title: title.length > 60 ? `🎃 The Haunted Lesson 👻` : title,
      content: fallbackContent,
      originalContent: options.content,
      originalTopic: options.fileName || 'Direct text input',
      characters: characters.map(char => char.name),
      keyLearningPoints: keyPoints,
      difficulty: 'intermediate',
      estimatedReadTime: this.estimateReadingTime(fallbackContent),
      createdAt: new Date().toISOString(),
    };
  }
}

export const storyGenerator = new StoryGeneratorService();