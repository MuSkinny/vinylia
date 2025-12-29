// Database types matching Supabase schema

export interface Profile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Vinyl {
  id: string;
  discogs_id?: number;
  musicbrainz_id?: string;
  artist: string;
  album: string;
  year?: number;
  release_date?: string;
  label?: string;
  catalog_number?: string;
  format?: string;
  country?: string;
  cover_art_url?: string;
  cover_art_thumb_url?: string;
  tracklist?: TracklistItem[];
  genres?: string[];
  created_at: string;
  updated_at: string;
}

export interface TracklistItem {
  position: number;
  title: string;
  duration?: string;
}

export interface UserVinyl {
  id: string;
  user_id: string;
  vinyl_id: string;
  acquired_date?: string;
  purchase_price?: number;
  condition?: string;
  notes?: string;
  is_favorite: boolean;
  play_count: number;
  added_at: string;
  updated_at: string;
  vinyl?: Vinyl;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_vinyl_id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  user_vinyl_id: string;
  title?: string;
  content: string;
  mood?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  user_vinyl?: UserVinyl;
  like_count?: number;
  comment_count?: number;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  story_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

// Discogs API types
export interface DiscogsSearchResult {
  id: number;
  type: string;
  title: string; // Format: "Artist - Album"
  year?: string;
  country?: string;
  format?: string[];
  label?: string[];
  catno?: string;
  barcode?: string[];
  genre?: string[];
  style?: string[];
  thumb?: string;
  cover_image?: string;
  resource_url?: string;
  master_id?: number;
  master_url?: string;
}

export interface DiscogsArtist {
  name: string;
  id: number;
  resource_url?: string;
}

export interface DiscogsLabel {
  name: string;
  catno?: string;
  id?: number;
}

export interface DiscogsFormat {
  name: string;
  qty: string;
  descriptions?: string[];
}

export interface DiscogsTrack {
  position: string;
  title: string;
  duration?: string;
}

export interface DiscogsImage {
  type: string;
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

export interface DiscogsIdentifier {
  type: string;
  value: string;
}

export interface DiscogsReleaseDetail {
  id: number;
  title: string;
  artists: DiscogsArtist[];
  year?: number;
  released?: string;
  country?: string;
  labels?: DiscogsLabel[];
  formats?: DiscogsFormat[];
  genres?: string[];
  styles?: string[];
  identifiers?: DiscogsIdentifier[];
  images?: DiscogsImage[];
  tracklist?: DiscogsTrack[];
  notes?: string;
  community?: {
    rating: { average: number; count: number };
    have: number;
    want: number;
  };
}

export interface VinylReleaseDetail {
  discogsId: number;
  artist: string;
  album: string;
  year?: number;
  releaseDate?: string;
  label?: string;
  catalogNumber?: string;
  format?: string;
  country?: string;
  coverArtUrl?: string;
  coverArtThumbUrl?: string;
  tracklist?: TracklistItem[];
  genres?: string[];
}

// Legacy MusicBrainz types (for backward compatibility)
export interface MusicBrainzRelease {
  id: string;
  title: string;
  artist: string;
  date?: string;
  country?: string;
  label?: string;
  format?: string;
  'track-count'?: number;
}

export interface MusicBrainzReleaseDetail {
  musicbrainzId: string;
  artist: string;
  album: string;
  year?: number;
  releaseDate?: string;
  label?: string;
  format?: string;
  coverArtUrl?: string;
  coverArtThumbUrl?: string;
  tracklist?: TracklistItem[];
  genres?: string[];
}
