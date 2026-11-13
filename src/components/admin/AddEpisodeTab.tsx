
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

interface AddEpisodeTabProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const AddEpisodeTab: React.FC<AddEpisodeTabProps> = ({
  stories,
  fetchStories,
  setSuccessMessage
}) => {
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [coinPrice, setCoinPrice] = useState('10');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueSeriesList = Array.from(
    new Set(stories.map(s => s.title))
  );

  useEffect(() => {
    if (selectedStoryTitle) {
      const count = stories.filter(
        s => s.title === selectedStoryTitle
      ).length;

      setEpisodeNumber(String(count + 1));
    } else {
      setEpisodeNumber('1');
    }
  }, [selectedStoryTitle, stories]);

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStoryTitle || !episodeTitle || !audioFile) {
      alert('Bhai, Story, Episode Title aur MP3 File select karo!');
      return;
    }

    if (!audioFile.name.toLowerCase().endsWith('.mp3')) {
      alert('Sirf MP3 audio file upload kar sakte ho!');
      return;
    }

    const price = Number(coinPrice);

    if (!Number.isFinite(price) || price < 0) {
      alert('Valid coin price enter karo!');
      return;
    }

    try {
      setUploading(true);

      const selectedStoryRef = stories.find(
        s => s.title === selectedStoryTitle
      );

      if (!selectedStoryRef) {
        throw new Error('Selected story nahi mili!');
      }

      const cleanTitle = episodeTitle
        .replace(/^episode\s*\d+[:\s]*/i, '')
        .trim();

      const formattedEpisodeTitle =
        `Episode ${episodeNumber}: ${cleanTitle}`;

      // Create safe file and folder names
      const safeStoryName = selectedStoryTitle
        .normalize('NFKD')
        .replace(/[^\w-]+/g, '-')
        .replace(/-+/g, '-');

      const safeEpisodeName = cleanTitle
        .normalize('NFKD')
        .replace(/[^\w-]+/g, '-')
        .replace(/-+/g, '-');

      const filePath =
        `${safeStoryName}/Episode-${episodeNumber}-${safeEpisodeName}.mp3`;

      // Upload MP3 directly to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('Episode')
        .upload(filePath, audioFile, {
          contentType: 'audio/mpeg',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Automatically generate public MP3 URL
      const { data: publicUrlData } = supabase.storage
        .from('Episode')
        .getPublicUrl(filePath);

      const generatedAudioUrl = publicUrlData.publicUrl;

      // Save episode details in database
      const { error: databaseError } = await supabase
        .from('stories')
        .insert([
          {
            title: selectedStoryTitle,
            episode_title: formattedEpisodeTitle,
            coin_price: price,
            audio_url: generatedAudioUrl,
            genre: selectedStoryRef.genre || 'Thriller',
            description: selectedStoryRef.description || '',
            poster_url: selectedStoryRef.poster_url || ''
          }
        ]);

      if (databaseError) {
        throw databaseError;
      }

      setSuccessMessage(
        '🎉 Episode and MP3 successfully uploaded!'
      );

      setEpisodeTitle('');
      setCoinPrice('10');
      setAudioFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (err: any) {
      console.error('Episode Upload Error:', err);

      alert(
        `❌ Upload Failed: ${err.message || 'Unknown error'}`
      );

    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleAddEpisode}
      className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg"
    >
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
        Publish Episode to Series
      </h3>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Select Story Series
        </label>

        <select
          value={selectedStoryTitle}
          onChange={e => setSelectedStoryTitle(e.target.value)}
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        >
          <option value="">-- Choose Series --</option>

          {uniqueSeriesList.map((title: any, idx) => (
            <option key={idx} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Episode Number (Auto-calculated)
        </label>

        <input
          type="number"
          min="1"
          value={episodeNumber}
          onChange={e => setEpisodeNumber(e.target.value)}
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-orange-400 font-bold outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Episode Title
        </label>

        <input
          type="text"
          value={episodeTitle}
          onChange={e => setEpisodeTitle(e.target.value)}
          placeholder="e.g. The Beginning"
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Coin Price (0 = Free)
        </label>

        <input
          type="number"
          min="0"
          value={coinPrice}
          onChange={e => setCoinPrice(e.target.value)}
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-2">
          Select Episode MP3 File
        </label>

        <div className="bg-[#0f0d13] border border-dashed border-orange-500/50 rounded-xl p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={e =>
              setAudioFile(e.target.files?.[0] || null)
            }
            className="w-full text-xs text-gray-300 file:bg-orange-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-2 file:mr-3 file:font-bold"
            required
          />

          {audioFile && (
            <div className="mt-3 text-xs text-orange-400 break-all">
              🎵 {audioFile.name}
              <p className="text-gray-500 mt-1">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <p className="text-[10px] text-gray-500 mt-2">
          MP3 will automatically upload to Supabase Episode bucket.
        </p>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
      >
        {uploading
          ? '⏳ Uploading MP3 & Publishing...'
          : '🚀 Upload & Publish Episode'}
      </button>
    </form>
  );
};
        
