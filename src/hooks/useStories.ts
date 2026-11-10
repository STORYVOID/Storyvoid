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
        .order('created_at', { ascending: false });

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
      // Strictly sort episodes by episode_number so EP 1 comes first, then EP 2, etc.
      episodes: story.episodes.sort(
        (a: any, b: any) =>
          Number(a.episode_number || 1) - Number(b.episode_number || 1)
      ),
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
    
