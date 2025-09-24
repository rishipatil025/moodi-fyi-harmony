// JioSaavn API integration for real music streaming
const JIOSAAVN_BASE_URL = 'https://jiosaavn-api-privateacc.vercel.app';

export interface JioSaavnTrack {
  id: string;
  name: string;
  primaryArtists: string;
  album: {
    name: string;
  };
  image: Array<{
    quality: string;
    link: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    link: string;
  }>;
  duration: string;
}

export interface SearchResult {
  data: {
    results: JioSaavnTrack[];
  };
}

export interface PlaylistResult {
  data: JioSaavnTrack[];
}

// Convert JioSaavn track to our Track interface
export const convertToTrack = (jiosaavnTrack: JioSaavnTrack) => ({
  id: jiosaavnTrack.id,
  title: jiosaavnTrack.name,
  artist: jiosaavnTrack.primaryArtists,
  album: jiosaavnTrack.album?.name || 'Unknown Album',
  albumArt: jiosaavnTrack.image?.[2]?.link || jiosaavnTrack.image?.[1]?.link || jiosaavnTrack.image?.[0]?.link || '',
  duration: parseInt(jiosaavnTrack.duration) || 0,
  url: jiosaavnTrack.downloadUrl?.[4]?.link || jiosaavnTrack.downloadUrl?.[3]?.link || jiosaavnTrack.downloadUrl?.[2]?.link || jiosaavnTrack.downloadUrl?.[1]?.link || jiosaavnTrack.downloadUrl?.[0]?.link,
});

// Search for songs
export const searchSongs = async (query: string, limit: number = 10) => {
  try {
    const response = await fetch(`${JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error('Search failed');
    
    const data: SearchResult = await response.json();
    return data.data.results.map(convertToTrack);
  } catch (error) {
    console.error('JioSaavn search error:', error);
    return [];
  }
};

// Get trending songs
export const getTrendingSongs = async (limit: number = 20) => {
  try {
    const response = await fetch(`${JIOSAAVN_BASE_URL}/search/songs?query=trending&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    
    const data: SearchResult = await response.json();
    return data.data.results.map(convertToTrack);
  } catch (error) {
    console.error('JioSaavn trending error:', error);
    return [];
  }
};

// Get songs by mood (using search with mood-related keywords)
export const getSongsByMood = async (mood: string, limit: number = 15) => {
  const moodQueries: Record<string, string[]> = {
    chill: ['chill', 'relaxing', 'ambient', 'lofi', 'peaceful'],
    melancholy: ['sad', 'emotional', 'melancholy', 'heartbreak', 'slow'],
    workout: ['energetic', 'motivation', 'gym', 'pump up', 'high energy'],
    focus: ['instrumental', 'concentration', 'study music', 'focus', 'ambient'],
    love: ['romantic', 'love songs', 'valentine', 'romance', 'heart'],
    party: ['party', 'dance', 'celebration', 'upbeat', 'happy']
  };

  const queries = moodQueries[mood] || ['popular'];
  
  try {
    // Search with multiple mood-related queries and combine results
    const searchPromises = queries.slice(0, 3).map(query => searchSongs(query, 5));
    const results = await Promise.all(searchPromises);
    
    // Flatten and deduplicate results
    const allTracks = results.flat();
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );
    
    return uniqueTracks.slice(0, limit);
  } catch (error) {
    console.error('JioSaavn mood search error:', error);
    return [];
  }
};

// Get song details by ID
export const getSongById = async (id: string) => {
  try {
    const response = await fetch(`${JIOSAAVN_BASE_URL}/songs?id=${id}`);
    if (!response.ok) throw new Error('Song fetch failed');
    
    const data: { data: JioSaavnTrack[] } = await response.json();
    return data.data[0] ? convertToTrack(data.data[0]) : null;
  } catch (error) {
    console.error('JioSaavn song fetch error:', error);
    return null;
  }
};