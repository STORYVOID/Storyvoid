export class AdMobService {
  static async initialize() {
    console.log('AdMob Safe Mode Initialized');
  }

  static async showRewardedAd(onRewardEarned: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate ad viewing experience safely without native crashes
      setTimeout(() => {
        try {
          // Success: Grant coins directly
          onRewardEarned();
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 1500); // 1.5 seconds delay to feel like a real ad
    });
  }
}
