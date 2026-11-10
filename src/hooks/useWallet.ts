
import { useCallback, useState } from 'react';
import { supabase } from '../supabaseClient';

interface WalletProps {
  isLoggedIn: boolean;
  showMessage: (
    title: string,
    message: string,
    isSuccess?: boolean
  ) => void;
}

export const useWallet = ({
  isLoggedIn,
  showMessage,
}: WalletProps) => {
  const [coins, setCoins] = useState(30);
  const [unlockedEpisodes, setUnlockedEpisodes] = useState<
    Record<string, boolean>
  >({});

  const fetchUserWallet = useCallback(async (userId: string) => {
    try {
      const [walletResult, unlockedResult] = await Promise.all([
        supabase
          .from('app_users')
          .select('coins')
          .eq('id', userId)
          .maybeSingle(),

        supabase
          .from('unlocked_episodes')
          .select('episode_id')
          .eq('user_id', userId),
      ]);

      if (walletResult.error) {
        console.error('Wallet fetch error:', walletResult.error);
      } else if (walletResult.data) {
        setCoins(walletResult.data.coins ?? 30);
      }

      if (unlockedResult.error) {
        console.error('Unlocked episodes error:', unlockedResult.error);
      } else {
        const unlockedMap: Record<string, boolean> = {};

        (unlockedResult.data || []).forEach((item: any) => {
          unlockedMap[item.episode_id] = true;
        });

        setUnlockedEpisodes(unlockedMap);
      }
    } catch (error) {
      console.error('Wallet loading failed:', error);
    }
  }, []);

  const resetWallet = useCallback(() => {
    setCoins(30);
    setUnlockedEpisodes({});
  }, []);

  const handleUnlockEpisode = useCallback(
    async (episodeId: string, price: number): Promise<boolean> => {
      if (!isLoggedIn) {
        showMessage(
          'Login Required',
          'Episode unlock karne ke liye pehle login karo.'
        );
        return false;
      }

      if (unlockedEpisodes[episodeId]) {
        return true;
      }

      try {
        const { data, error } = await supabase.rpc(
          'unlock_episode_with_coins',
          { p_episode_id: episodeId }
        );

        if (error) {
          console.error('Episode unlock error:', error);
          showMessage(
            'Unlock Failed',
            'Episode unlock nahi ho paya. Dobara try karo.'
          );
          return false;
        }

        const result = Array.isArray(data) ? data[0] : data;

        if (!result) {
          showMessage(
            'Unlock Failed',
            'Server se valid response nahi mila.'
          );
          return false;
        }

        if (result.balance !== null && result.balance !== undefined) {
          setCoins(Number(result.balance));
        }

        if (
          result.message === 'unlocked' ||
          result.message === 'already_unlocked'
        ) {
          setUnlockedEpisodes((previous) => ({
            ...previous,
            [episodeId]: true,
          }));

          if (result.message === 'unlocked') {
            showMessage(
              'Episode Unlocked!',
              `Episode successfully unlock ho gaya. ${price} coins use hue.`,
              true
            );
          }

          return true;
        }

        const messages: Record<string, [string, string]> = {
          insufficient_coins: [
            'Insufficient Coins',
            'Aapke paas is episode ko unlock karne ke liye enough coins nahi hain.',
          ],
          not_logged_in: [
            'Login Required',
            'Episode unlock karne ke liye login karo.',
          ],
          user_record_not_found: [
            'Account Error',
            'Aapka wallet record nahi mila. Please dobara login karo.',
          ],
          episode_not_found: [
            'Episode Not Found',
            'Ye episode ab available nahi hai.',
          ],
        };

        const message = messages[result.message];

        showMessage(
          message?.[0] || 'Unlock Failed',
          message?.[1] || result.message || 'Episode unlock nahi ho paya.'
        );

        return false;
      } catch (error: any) {
        console.error('Unlock exception:', error);
        showMessage('Error', error.message || 'Something went wrong.');
        return false;
      }
    },
    [isLoggedIn, unlockedEpisodes, showMessage]
  );

  return {
    coins,
    setCoins,
    unlockedEpisodes,
    setUnlockedEpisodes,
    fetchUserWallet,
    resetWallet,
    handleUnlockEpisode,
  };
};
              
