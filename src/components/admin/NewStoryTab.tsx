
import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';

interface NewStoryTabProps {
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

export const NewStoryTab: React.FC<NewStoryTabProps> = ({
  fetchStories,
  setSuccessMessage
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [description, setDescription] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const genresList = [
    'Fantasy', 'Romance', 'Crime', 'Thriller',
    'Horror', 'Mystery', 'Action', 'Drama',
    'Sci-Fi', 'Comedy'
  ];

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !posterFile) {
      alert('Bhai, Story Title aur Poster select karna zaroori hai!');
      return;
    }

    if (!posterFile.type.startsWith('image/')) {
      alert('Sirf JPG, PNG ya WEBP image select karo!');
      return;
    }

    let uploadedPosterPath: string | null = null;

    try {
      setLoading(true);

      // Create safe file names
      const safeTitle = title.trim()
        .normalize('NFKD')
        .replace(/[^\w-]+/g, '-')
        .replace(/-+/g, '-');

      const extension = posterFile.name.split('.').pop()?.toLowerCase() || 'jpg';

      const uniqueFileName =
        `${safeTitle}-${Date.now()}.${extension}`;

      // Upload poster directly to Supabase
      const filePath = `posters/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Episode')
        .upload(filePath, posterFile, {
          contentType: posterFile.type,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      uploadedPosterPath = filePath;

      // Generate automatic public poster URL
      const { data: publicUrlData } = supabase.storage
        .from('Episode')
        .getPublicUrl(filePath);

      const generatedPosterUrl = publicUrlData.publicUrl;

      if (!generatedPosterUrl) {
        throw new Error('Poster URL generate nahi hua!');
      }

      // Save story in database
      const { error: databaseError } = await supabase
        .from('stories')
        .insert([
          {
            title: title.trim(),
            episode_title: 'Episode 1: Pilot',
            coin_price: 0,
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: genre,
            description: description.trim(),
            poster_url: generatedPosterUrl
          }
        ]);

      if (databaseError) {
        throw databaseError;
      }

      setSuccessMessage(
        '✨ New Story & Poster successfully published!'
      );

      setTitle('');
      setGenre('Fantasy');
      setDescription('');
      setPosterFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchStories();

      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (err: any) {
      console.error('Error creating story:', err);

      // Remove uploaded poster if database save fails
      if (uploadedPosterPath) {
        const { error: cleanupError } = await supabase.storage
          .from('Episode')
          .remove([uploadedPosterPath]);

        if (cleanupError) {
          console.error('Poster cleanup error:', cleanupError);
        }
      }

      alert(
        `❌ Error: ${err.message || 'Unknown error'}`
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateStory}
      className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-4 shadow-lg"
    >
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
        ➕ Create New Story Series
      </h3>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Series Title
        </label>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Another World"
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Genre
        </label>

        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
        >
          {genresList.map((g, idx) => (
            <option key={idx} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-2">
          Select Story Poster
        </label>

        <div className="bg-[#0f0d13] border border-dashed border-orange-500/50 rounded-xl p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e =>
              setPosterFile(e.target.files?.[0] || null)
            }
            className="w-full text-xs text-gray-300 file:bg-orange-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-2 file:mr-3 file:font-bold"
            required
          />

          {posterFile && (
            <div className="mt-3 text-xs text-orange-400 break-all">
              🖼️ {posterFile.name}

              <p className="text-gray-500 mt-1">
                {(posterFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <p className="text-[10px] text-gray-500 mt-2">
          JPG, PNG and WEBP supported. Poster automatically uploads to Supabase.
        </p>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1">
          Series Description
        </label>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Write a brief description about the series..."
          className="w-full bg-[#0f0d13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 h-20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
      >
        {loading
          ? '⏳ Uploading Poster & Creating Story...'
          : '✨ Upload Poster & Create Story'}
      </button>
    </form>
  );
};
        
