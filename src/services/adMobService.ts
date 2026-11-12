import { AdMob, RewardAdReward, RewardedAdPluginEvents } from '@capacitor-community/admob';

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
      // Prepare Rewarded Ad (Replace with real Ad Unit ID if needed, using Google test ID for safety)
      await AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-3940256099942544/5224354917', // Google Test Rewarded Ad ID
        isTesting: true,
      });

      // Listen for reward event
      const rewardListener = AdMob.addListener(
        RewardedAdPluginEvents.Rewarded,
        (reward: RewardAdReward) => {
          console.log('Reward earned:', reward);
          onRewardEarned();
        }
      );

      // Show the ad
      const reward = await AdMob.showRewardVideoAd();
      
      // Clean up listener
      rewardListener.remove();
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      throw error;
    }
  }
}
