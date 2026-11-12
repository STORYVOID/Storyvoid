
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { PluginListenerHandle } from '@capacitor/core';
import { ADMOB_CONFIG } from '../config/admob';

export class AdMobService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    await AdMob.initialize({
      initializeForTesting: ADMOB_CONFIG.mode === 'TEST',
    });

    this.initialized = true;
  }

  static async showRewardedAd(
    onRewardEarned: () => void | Promise<void>
  ): Promise<void> {
    await this.initialize();

    const listeners: PluginListenerHandle[] = [];
    let rewarded = false;
    let settled = false;

    return new Promise<void>(async (resolve, reject) => {
      const cleanup = async () => {
        await Promise.all(
          listeners.map(listener => listener.remove())
        );
      };

      const finish = async (error?: Error) => {
        if (settled) return;
        settled = true;
        await cleanup();

        if (error) reject(error);
        else resolve();
      };

      try {
        listeners.push(
          await AdMob.addListener(
            RewardAdPluginEvents.Rewarded,
            async () => {
              if (rewarded || settled) return;

              rewarded = true;

              try {
                await onRewardEarned();
                await finish();
              } catch (error) {
                await finish(
                  error instanceof Error
                    ? error
                    : new Error('Reward could not be processed')
                );
              }
            }
          )
        );

        listeners.push(
          await AdMob.addListener(
            RewardAdPluginEvents.Dismissed,
            async () => {
              if (!rewarded) {
                await finish(new Error('Ad closed without reward'));
              }
            }
          )
        );

        listeners.push(
          await AdMob.addListener(
            RewardAdPluginEvents.FailedToShow,
            async () => {
              await finish(new Error('Rewarded ad failed to show'));
            }
          )
        );

        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_CONFIG.rewardedAdUnitId,
          isTesting: ADMOB_CONFIG.mode === 'TEST',
        });

        if (!settled) {
          await AdMob.showRewardVideoAd();
        }
      } catch (error) {
        await finish(
          error instanceof Error
            ? error
            : new Error('Rewarded ad could not be loaded')
        );
      }
    });
  }
            }
