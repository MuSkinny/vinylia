import { supabase } from './supabase';
import type {
  Vinyl,
  UserVinyl,
  DiscogsSearchResult,
  DiscogsReleaseDetail,
  VinylReleaseDetail,
  TracklistItem,
} from '@/types/database';

const DISCOGS_API = 'https://api.discogs.com';
const DISCOGS_TOKEN = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;

if (!DISCOGS_TOKEN) {
  console.warn('⚠️ DISCOGS_TOKEN not set. Please add it to your .env file.');
  console.warn('Get your token at: https://www.discogs.com/settings/developers');
}

export const vinylService = {
  // Search Discogs for vinyl releases
  async searchVinyls(query: string, limit: number = 20): Promise<DiscogsSearchResult[]> {
    if (!DISCOGS_TOKEN) {
      throw new Error('Discogs token not configured. Add EXPO_PUBLIC_DISCOGS_TOKEN to .env');
    }

    try {
      // Search for vinyl releases only
      const params = new URLSearchParams({
        q: query,
        type: 'release',
        format: 'Vinyl',
        per_page: limit.toString(),
        token: DISCOGS_TOKEN,
      });

      const response = await fetch(
        `${DISCOGS_API}/database/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'Vinylia/1.0.0 +https://vinylia.app',
          },
        }
      );

      if (!response.ok) {
        const remaining = response.headers.get('X-Discogs-Ratelimit-Remaining');
        if (remaining && parseInt(remaining) === 0) {
          throw new Error('Discogs rate limit reached. Please try again in a minute.');
        }
        throw new Error(`Discogs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Discogs search error:', error);
      throw error;
    }
  },

  // Search Discogs by barcode
  async searchByBarcode(barcode: string): Promise<DiscogsSearchResult[]> {
    if (!DISCOGS_TOKEN) {
      throw new Error('Discogs token not configured. Add EXPO_PUBLIC_DISCOGS_TOKEN to .env');
    }

    try {
      // Search by barcode for vinyl format only
      const params = new URLSearchParams({
        barcode: barcode,
        type: 'release',
        format: 'Vinyl',
        per_page: '20',
        token: DISCOGS_TOKEN,
      });

      const response = await fetch(
        `${DISCOGS_API}/database/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'Vinylia/1.0.0 +https://vinylia.app',
          },
        }
      );

      if (!response.ok) {
        const remaining = response.headers.get('X-Discogs-Ratelimit-Remaining');
        if (remaining && parseInt(remaining) === 0) {
          throw new Error('Discogs rate limit reached. Please try again in a minute.');
        }
        throw new Error(`Discogs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Discogs barcode search error:', error);
      throw error;
    }
  },

  // Get release details from Discogs
  async getReleaseDetails(releaseId: string | number): Promise<VinylReleaseDetail | null> {
    if (!DISCOGS_TOKEN) {
      throw new Error('Discogs token not configured. Add EXPO_PUBLIC_DISCOGS_TOKEN to .env');
    }

    try {
      const response = await fetch(
        `${DISCOGS_API}/releases/${releaseId}?token=${DISCOGS_TOKEN}`,
        {
          headers: {
            'User-Agent': 'Vinylia/1.0.0 +https://vinylia.app',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status}`);
      }

      const release: DiscogsReleaseDetail = await response.json();

      // Extract artist name (handle multiple artists)
      const artist = release.artists?.[0]?.name || 'Unknown Artist';

      // Extract album title (remove artist from title if present)
      const title = release.title || 'Unknown Album';
      const album = title.includes(' - ') ? title.split(' - ').slice(1).join(' - ') : title;

      // Get primary cover image
      const primaryImage = release.images?.find(img => img.type === 'primary') || release.images?.[0];
      const coverArtUrl = primaryImage?.uri;
      const coverArtThumbUrl = primaryImage?.uri150;

      // Extract format details (e.g., "2xLP", "12\"", "Gatefold")
      const formatDescriptions = release.formats?.[0]?.descriptions || [];
      const format = formatDescriptions.join(', ') || 'Vinyl';

      // Get label and catalog number
      const label = release.labels?.[0]?.name;
      const catalogNumber = release.labels?.[0]?.catno;

      // Convert tracklist
      const tracklist: TracklistItem[] = (release.tracklist || []).map((track, index) => ({
        position: this.parseTrackPosition(track.position, index + 1),
        title: track.title,
        duration: track.duration,
      }));

      // Combine genres and styles
      const genres = [
        ...(release.genres || []),
        ...(release.styles || []),
      ];

      return {
        discogsId: release.id,
        artist,
        album,
        year: release.year,
        releaseDate: release.released,
        label,
        catalogNumber,
        format,
        country: release.country,
        coverArtUrl,
        coverArtThumbUrl,
        tracklist,
        genres,
      };
    } catch (error) {
      console.error('Failed to get release details:', error);
      throw error;
    }
  },

  // Helper: Parse track position (e.g., "A1", "B2" → 1, 2)
  parseTrackPosition(position: string, fallback: number): number {
    // Extract numbers from position string
    const match = position.match(/\d+/);
    return match ? parseInt(match[0]) : fallback;
  },

  // Add vinyl to Supabase (if not exists) and to user's collection
  async addToCollection(
    userId: string,
    vinylData: VinylReleaseDetail,
    options?: { story?: string; mood?: string }
  ) {
    // First, check if vinyl exists in canonical table
    let { data: existingVinyl, error: searchError } = await supabase
      .from('vinyls')
      .select('*')
      .eq('discogs_id', vinylData.discogsId)
      .single();

    let vinylId: string;

    if (!existingVinyl) {
      // Create new vinyl entry
      const { data: newVinyl, error: insertError } = await supabase
        .from('vinyls')
        .insert({
          discogs_id: vinylData.discogsId,
          artist: vinylData.artist,
          album: vinylData.album,
          year: vinylData.year,
          release_date: vinylData.releaseDate,
          label: vinylData.label,
          catalog_number: vinylData.catalogNumber,
          format: vinylData.format,
          country: vinylData.country,
          cover_art_url: vinylData.coverArtUrl,
          cover_art_thumb_url: vinylData.coverArtThumbUrl,
          tracklist: vinylData.tracklist,
          genres: vinylData.genres,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      vinylId = newVinyl.id;
    } else {
      vinylId = existingVinyl.id;
    }

    // Add to user's collection with optional story and mood
    const { data: userVinyl, error: userVinylError } = await supabase
      .from('user_vinyls')
      .insert({
        user_id: userId,
        vinyl_id: vinylId,
        story: options?.story,
        mood: options?.mood,
        is_public: true, // Default to public for social sharing
      })
      .select('*, vinyl:vinyls(*)')
      .single();

    if (userVinylError) throw userVinylError;
    return userVinyl;
  },

  // Get user's library
  async getUserLibrary(userId: string) {
    const { data, error } = await supabase
      .from('user_vinyls')
      .select(`
        *,
        vinyl:vinyls(*),
        tags(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single user vinyl
  async getUserVinyl(userVinylId: string) {
    const { data, error } = await supabase
      .from('user_vinyls')
      .select(`
        *,
        vinyl:vinyls(*),
        tags(*),
        stories(*)
      `)
      .eq('id', userVinylId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user vinyl
  async updateUserVinyl(userVinylId: string, updates: Partial<UserVinyl>) {
    const { data, error } = await supabase
      .from('user_vinyls')
      .update(updates)
      .eq('id', userVinylId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user vinyl
  async deleteUserVinyl(userVinylId: string) {
    const { error } = await supabase
      .from('user_vinyls')
      .delete()
      .eq('id', userVinylId);

    if (error) throw error;
  },

  // Add tag to user vinyl
  async addTag(userVinylId: string, name: string, color?: string) {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_vinyl_id: userVinylId,
        name,
        color,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update vinyl story
  async updateStory(userVinylId: string, story: string) {
    const { data, error } = await supabase
      .from('user_vinyls')
      .update({ story })
      .eq('id', userVinylId)
      .select('*, vinyl:vinyls(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Update vinyl mood
  async updateMood(userVinylId: string, mood: string) {
    const { data, error } = await supabase
      .from('user_vinyls')
      .update({ mood })
      .eq('id', userVinylId)
      .select('*, vinyl:vinyls(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Remove from library (alias for deleteUserVinyl with better name)
  async removeFromLibrary(userVinylId: string) {
    const { error } = await supabase
      .from('user_vinyls')
      .delete()
      .eq('id', userVinylId);

    if (error) throw error;
  },

  // Helper: Format duration
  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  // Helper: Extract artist and album from Discogs title
  parseDiscogsTitle(title: string): { artist: string; album: string } {
    // Discogs format: "Artist - Album" or just "Album"
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      return {
        artist: parts[0].trim(),
        album: parts.slice(1).join(' - ').trim(),
      };
    }
    return {
      artist: 'Unknown Artist',
      album: title.trim(),
    };
  },
};
