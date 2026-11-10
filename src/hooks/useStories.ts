import { useCallback, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useStories = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      setLoadingStories(true);

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: true }); // Ascending taaki purane episodes pehle aayein

      if (error) throw error;

      setStories(data || []);
    } catch (error) {
      console.error('Stories loading error:', error);
    } finally {
      setLoadingStories(false);
    }
  }, []);

  const series = useMemo(() => {
    const groupedStories = stories.reduce(
      (groups: Record<string, any>, episode: any) => {
        const title = episode.title || 'Untitled Story';

        if (!groups[title]) {
          groups[title] = {
            title,
            genre: episode.genre || 'Drama',
            description: episode.description || '',
            poster_url: episode.poster_url || episode.cover_url || '',
            cover_url: episode.cover_url || episode.poster_url || '',
            episodes: [],
          };
        }

        groups[title].episodes.push(episode);

        return groups;
      },
      {}
    );

    return Object.values(groupedStories).map((story: any) => ({
      ...story,
      // Sort episodes: pehle episode_number se, agar wo same ho toh created_at se
      episodes: story.episodes.sort((a: any, b: any) => {
        const numA = Number(a.episode_number) || 0;
        const numB = Number(b.episode_number) || 0;
        if (numA !== numB) {
          return numA - numB;
        }
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }),
      episodesCount: story.episodes.length,
    }));
  }, [stories]);

  return {
    stories,
    setStories,
    loadingStories,
    fetchStories,
    series,
  };
};
