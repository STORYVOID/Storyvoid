export interface Story {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  genre: string;
  author: string;
  created_at: string;
}

export interface Episode {
  id: string;
  story_id: string;
  episode_number: number;
  title: string;
  audio_url: string;
  duration: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  credits: number;
}
