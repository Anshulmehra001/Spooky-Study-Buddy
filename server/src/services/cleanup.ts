import { storyStorage } from './storyStorage.js';

export class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Start automatic cleanup of expired stories
   * Runs every 6 hours by default
   */
  startAutomaticCleanup(intervalHours: number = 6): void {
    if (this.cleanupInterval) {
      this.stopAutomaticCleanup();
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    console.log(`Starting automatic story cleanup every ${intervalHours} hours`);
    
    // Run cleanup immediately
    this.runCleanup();
    
    // Schedule recurring cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, intervalMs);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Automatic story cleanup stopped');
    }
  }

  /**
   * Run cleanup manually
   */
  async runCleanup(): Promise<void> {
    try {
      console.log('Running story cleanup...');
      const deletedCount = await storyStorage.cleanupExpiredStories();
      console.log(`Cleanup completed: ${deletedCount} expired stories removed`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export const cleanupService = new CleanupService();