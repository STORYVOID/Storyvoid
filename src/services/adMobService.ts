import { AdMob, RewardAdReward } from '@capacitor-community/admob';

export class AdMobService {
  static async initialize() {
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
      });
    } catch (e) {
      console.error('AdMob initialization error:', e);
    }
  }

  static async showRewardedAd(onRewardEarned: () => void): Promise<void> {
    try {
      // Prepare Rewarded Ad using Google Test Ad ID
      await AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-3940256099942544/5224354917',
        isTesting: true,
      });

      // Show the ad directly and give reward when completed
      const reward: RewardAdReward = await AdMob.showRewardVideoAd();
      
      if (reward) {
        onRewardEarned();
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      throw error;
    }
  }
}
