// src/services/adMobService.ts
import { AdMob, RewardAdReward } from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../config/admob';

export class AdMobService {
  private static initialized = false;

  public static async init() {
    if (this.initialized) return;
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: ADMOB_CONFIG.mode === "TEST",
      });
      this.initialized = true;
    } catch (e) {
      console.error("AdMob initialization failed:", e);
    }
  }

  public static async showRewardedAd(onRewardEarned: () => void): Promise<void> {
    try {
      await this.init();

      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_CONFIG.rewardedAdUnitId,
      });

      const reward: RewardAdReward = await AdMob.showRewardVideoAd();
      
      if (reward) {
        onRewardEarned();
      }
    } catch (error) {
      console.error("Rewarded ad failed to load or show:", error);
      throw error;
    }
  }
}
