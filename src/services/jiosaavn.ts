// JioSaavn API integration with fallback sample tracks
const JIOSAAVN_BASE_URL = 'https://saavn.dev/api';

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

// Fallback sample tracks for when API fails
const getFallbackTracks = (mood: string): any[] => {
  const fallbackTracks = [
    {
      id: `${mood}-1`,
      title: `${mood} Vibes`,
      artist: 'Mood Artist',
      album: `${mood} Collection`,
      albumArt: 'https://picsum.photos/300/300?random=1',
      duration: 180,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: `${mood}-2`, 
      title: `${mood} Dreams`,
      artist: 'Ambient Sounds',
      album: `${mood} Experience`,
      albumArt: 'https://picsum.photos/300/300?random=2',
      duration: 240,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: `${mood}-3`,
      title: `${mood} Journey`,
      artist: 'Melody Maker', 
      album: `${mood} Stories`,
      albumArt: 'https://picsum.photos/300/300?random=3',
      duration: 195,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    }
  ];
  
  return fallbackTracks;
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
    
    // Prefer tracks that already include streaming URLs
    const withUrl = uniqueTracks.filter(t => !!t.url);
    if (withUrl.length > 0) {
      return withUrl.slice(0, limit);
    }

    // Try to fetch details to resolve URLs
    const detailed = await Promise.all(
      uniqueTracks.slice(0, limit * 2).map(t => getSongById(t.id))
    );
    const detailedWithUrl = detailed.filter((t): t is any => !!t && !!t.url);

    if (detailedWithUrl.length > 0) {
      return detailedWithUrl.slice(0, limit);
    }

    // Fallback to sample tracks if still no URLs
    console.log('Using fallback tracks for mood:', mood);
    return getFallbackTracks(mood);
  } catch (error) {
    console.error('JioSaavn mood search error:', error);
    // Return fallback tracks when API fails
    return getFallbackTracks(mood);
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