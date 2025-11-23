import fs from 'fs/promises';
import path from 'path';
import { SpookyStory } from '../types.js';

const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');
const STORIES_INDEX_FILE = path.join(STORIES_DIR, 'index.json');

export interface StoredStoryIndex {
  [storyId: string]: {
    id: string;
    title: string;
    originalTopic: string;
    createdAt: string;
    filePath: string;
    shareableLink?: string;
    expiresAt?: string;
  };
}

export class StoryStorageService {
  constructor() {
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(STORIES_DIR, { recursive: true });
      
      // Create index file if it doesn't exist
      try {
        await fs.access(STORIES_INDEX_FILE);
      } catch {
        await fs.writeFile(STORIES_INDEX_FILE, JSON.stringify({}));
      }
    } catch (error) {
      console.error('Error creating stories directory:', error);
    }
  }

  private async loadIndex(): Promise<StoredStoryIndex> {
    try {
      const indexData = await fs.readFile(STORIES_INDEX_FILE, 'utf-8');
      return JSON.parse(indexData);
    } catch (error) {
      console.error('Error loading stories index:', error);
      return {};
    }
  }

  private async saveIndex(index: StoredStoryIndex): Promise<void> {
    try {
      await fs.writeFile(STORIES_INDEX_FILE, JSON.stringify(index, null, 2));
    } catch (error) {
      console.error('Error saving stories index:', error);
    }
  }

  private generateShareableLink(storyId: string): string {
    // Generate a shareable link with a random token
    const token = Math.random().toString(36).substr(2, 12);
    return `${storyId}-${token}`;
  }

  async saveStory(story: SpookyStory): Promise<string> {
    try {
      await this.ensureStorageDirectory();
      
      const storyFilePath = path.join(STORIES_DIR, `${story.id}.json`);
      const shareableLink = this.generateShareableLink(story.id);
      
      // Add shareable link to story
      const storyWithLink = {
        ...story,
        shareableLink
      };

      // Save story file
      await fs.writeFile(storyFilePath, JSON.stringify(storyWithLink, null, 2));

      // Update index
      const index = await this.loadIndex();
      index[story.id] = {
        id: story.id,
        title: story.title,
        originalTopic: story.originalTopic,
        createdAt: story.createdAt,
        filePath: storyFilePath,
        shareableLink,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      await this.saveIndex(index);

      console.log(`Story saved: ${story.id} with shareable link: ${shareableLink}`);
      return shareableLink;

    } catch (error) {
      console.error('Error saving story:', error);
      throw new Error('Failed to save story');
    }
  }

  async getStory(storyId: string): Promise<SpookyStory | null> {
    try {
      const index = await this.loadIndex();
      const storyInfo = index[storyId];

      if (!storyInfo) {
        return null;
      }

      // Check if story has expired
      if (storyInfo.expiresAt && new Date(storyInfo.expiresAt) < new Date()) {
        await this.deleteStory(storyId);
        return null;
      }

      const storyData = await fs.readFile(storyInfo.filePath, 'utf-8');
      return JSON.parse(storyData);

    } catch (error) {
      console.error('Error loading story:', error);
      return null;
    }
  }

  async getStoryByShareableLink(shareableLink: string): Promise<SpookyStory | null> {
    try {
      const index = await this.loadIndex();
      
      // Find story by shareable link
      const storyEntry = Object.values(index).find(
        entry => entry.shareableLink === shareableLink
      );

      if (!storyEntry) {
        return null;
      }

      return this.getStory(storyEntry.id);

    } catch (error) {
      console.error('Error loading story by shareable link:', error);
      return null;
    }
  }

  async getAllStories(limit: number = 50): Promise<SpookyStory[]> {
    try {
      const index = await this.loadIndex();
      const stories: SpookyStory[] = [];

      const sortedEntries = Object.values(index)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      for (const entry of sortedEntries) {
        // Check if story has expired
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
          await this.deleteStory(entry.id);
          continue;
        }

        const story = await this.getStory(entry.id);
        if (story) {
          stories.push(story);
        }
      }

      return stories;

    } catch (error) {
      console.error('Error loading all stories:', error);
      return [];
    }
  }

  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const index = await this.loadIndex();
      const storyInfo = index[storyId];

      if (!storyInfo) {
        return false;
      }

      // Delete story file
      try {
        await fs.unlink(storyInfo.filePath);
      } catch (error) {
        console.error('Error deleting story file:', error);
      }

      // Remove from index
      delete index[storyId];
      await this.saveIndex(index);

      console.log(`Story deleted: ${storyId}`);
      return true;

    } catch (error) {
      console.error('Error deleting story:', error);
      return false;
    }
  }

  async cleanupExpiredStories(): Promise<number> {
    try {
      const index = await this.loadIndex();
      const now = new Date();
      let deletedCount = 0;

      for (const [storyId, storyInfo] of Object.entries(index)) {
        if (storyInfo.expiresAt && new Date(storyInfo.expiresAt) < now) {
          await this.deleteStory(storyId);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} expired stories`);
      return deletedCount;

    } catch (error) {
      console.error('Error cleaning up expired stories:', error);
      return 0;
    }
  }
}

export const storyStorage = new StoryStorageService();