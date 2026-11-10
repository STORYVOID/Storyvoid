
import { useCallback, useRef, useState } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentPlayingEpisode, setCurrentPlayingEpisode] =
    useState<any>(null);

  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = useCallback(
    async (episode: any, episodes?: any[]) => {
      if (!episode) return;

      if (episodes?.length) {
        setPlaylist(episodes);
        const index = episodes.findIndex(
          (item) => item.id === episode.id
        );
        setCurrentIndex(index >= 0 ? index : 0);
      }

      setCurrentPlayingEpisode(episode);

      const audio = audioRef.current;
      if (!audio) return;

      const audioUrl = episode.audio_url || '';

      if (!audioUrl) {
        setIsPlaying(false);
        return;
      }

      audio.src = audioUrl;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
      }
    },
    []
  );

  const playNext = useCallback(async () => {
    if (!playlist.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      setIsPlaying(false);
      return;
    }

    const nextEpisode = playlist[nextIndex];
    setCurrentIndex(nextIndex);
    await playAudio(nextEpisode);
  }, [playlist, currentIndex, playAudio]);

  const playPrevious = useCallback(async () => {
    if (!playlist.length) return;

    const previousIndex = currentIndex - 1;
    if (previousIndex < 0) return;

    const previousEpisode = playlist[previousIndex];
    setCurrentIndex(previousIndex);
    await playAudio(previousEpisode);
  }, [playlist, currentIndex, playAudio]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    void playNext();
  }, [playNext]);

  return {
    audioRef,
    currentPlayingEpisode,
    setCurrentPlayingEpisode,
    playlist,
    setPlaylist,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    playAudio,
    playNext,
    playPrevious,
    togglePlayback,
    handleAudioEnded,
  };
};
