// JioSaavn API integration with fallback sample tracks
const JIOSAAVN_BASE_URL = 'https://saavn.sumit.co/api';
const CORS_PROXY = 'https://corsproxy.io/?';

export interface JioSaavnTrack {
  id: string;
  name: string;
  primaryArtists: string;
  album: {
    name: string;
  };
  image: Array<{
    quality: string;
    url: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    url: string;
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
  albumArt: jiosaavnTrack.image?.[2]?.url || jiosaavnTrack.image?.[1]?.url || jiosaavnTrack.image?.[0]?.url || '',
  duration: parseInt(jiosaavnTrack.duration) || 0,
  url: jiosaavnTrack.downloadUrl?.[4]?.url || jiosaavnTrack.downloadUrl?.[3]?.url || jiosaavnTrack.downloadUrl?.[2]?.url || jiosaavnTrack.downloadUrl?.[1]?.url || jiosaavnTrack.downloadUrl?.[0]?.url,
});

// Search for songs
export const searchSongs = async (query: string, limit: number = 10) => {
  try {
    const url = `${JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
    const attempts = [
      url,
      `https://cors.isomorphic-git.org/${url}`,
      `${CORS_PROXY}${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/${url}`,
    ];
    let lastError: any = null;
    for (const attemptUrl of attempts) {
      try {
        const response = await fetch(attemptUrl);
        if (response.ok) {
          const data: SearchResult = await response.json();
          return data.data.results.map(convertToTrack);
        }
        lastError = new Error(`HTTP ${response.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    console.error('JioSaavn search error:', lastError);
    return [];
  } catch (error) {
    console.error('JioSaavn search error:', error);
    return [];
  }
};

// Get trending songs
export const getTrendingSongs = async (limit: number = 20) => {
  try {
    const url = `${JIOSAAVN_BASE_URL}/search/songs?query=trending&limit=${limit}`;
    const attempts = [
      url,
      `https://cors.isomorphic-git.org/${url}`,
      `${CORS_PROXY}${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/${url}`,
    ];
    let lastError: any = null;
    for (const attemptUrl of attempts) {
      try {
        const response = await fetch(attemptUrl);
        if (response.ok) {
          const data: SearchResult = await response.json();
          return data.data.results.map(convertToTrack);
        }
        lastError = new Error(`HTTP ${response.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    console.error('JioSaavn trending error:', lastError);
    return [];
  } catch (error) {
    console.error('JioSaavn trending error:', error);
    return [];
  }
};

// Fallback sample tracks for when API fails
const getFallbackTracks = (mood: string): any[] => {
  const localUrl = '/audio/sample.mp3';
  const fallbackTracks = [
    {
      id: `${mood}-1`,
      title: `${mood} Vibes`,
      artist: 'Mood Artist',
      album: `${mood} Collection`,
      albumArt: 'https://picsum.photos/300/300?random=1',
      duration: 180,
      url: localUrl,
    },
    {
      id: `${mood}-2`, 
      title: `${mood} Dreams`,
      artist: 'Ambient Sounds',
      album: `${mood} Experience`,
      albumArt: 'https://picsum.photos/300/300?random=2',
      duration: 240,
      url: localUrl,
    },
    {
      id: `${mood}-3`,
      title: `${mood} Journey`,
      artist: 'Melody Maker', 
      album: `${mood} Stories`,
      albumArt: 'https://picsum.photos/300/300?random=3',
      duration: 195,
      url: localUrl,
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
    const url = `${JIOSAAVN_BASE_URL}/songs?ids=${id}`;
    const attempts = [
      url,
      `https://cors.isomorphic-git.org/${url}`,
      `${CORS_PROXY}${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/${url}`,
    ];
    let lastError: any = null;
    for (const attemptUrl of attempts) {
      try {
        const response = await fetch(attemptUrl);
        if (response.ok) {
          const data: { data: JioSaavnTrack[] } = await response.json();
          return data.data[0] ? convertToTrack(data.data[0]) : null;
        }
        lastError = new Error(`HTTP ${response.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    console.error('JioSaavn song fetch error:', lastError);
    return null;
  } catch (error) {
    console.error('JioSaavn song fetch error:', error);
    return null;
  }
};