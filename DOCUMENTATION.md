# Vinylia - Documentation

**A thoughtful, human-centered vinyl collection and storytelling app**

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Components](#components)
7. [Services](#services)
8. [Design System](#design-system)
9. [Migration History](#migration-history)

---

## Overview

Vinylia is a React Native mobile application for vinyl collectors to:
- Catalog and organize their vinyl collection
- Share personal stories and memories attached to records
- Discover new music through thoughtful community engagement
- Create themed collections (playlists) of their vinyls
- Connect with other collectors in a non-toxic, human-centered way

**Core Philosophy**: Less Instagram, more human. No public like counts, no toxic metrics. Focus on personal stories and meaningful connections.

---

## Tech Stack

### Frontend
- **React Native** with **Expo Router** (file-based routing)
- **TypeScript** for type safety
- **TanStack Query (React Query)** for data fetching and caching
- **Expo** for build tooling and native capabilities

### Backend
- **Supabase** for backend infrastructure
  - PostgreSQL database
  - Row Level Security (RLS) for authorization
  - Auth for user management
  - Real-time subscriptions (not yet implemented)

### External APIs
- **MusicBrainz API** for vinyl metadata (artist, album, cover art, tracklist)
- **Cover Art Archive** for album artwork

### Design
- Custom design system with:
  - Color palette (warm, earthy tones)
  - Typography scale
  - Spacing system
  - Mood-based color system (warm, nostalgic, night, calm, energy)

---

## Database Schema

### Core Tables

#### `profiles`
Extends Supabase auth.users with user profile data.
```sql
- id (UUID, FK to auth.users)
- email (TEXT, unique)
- username (TEXT, unique)
- display_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at, updated_at
```

#### `vinyls`
Canonical vinyl metadata from MusicBrainz.
```sql
- id (UUID)
- musicbrainz_id (TEXT, unique)
- artist, album, year
- label, catalog_number, country
- cover_art_url, cover_art_thumb_url
- tracklist (JSONB)
- genres (TEXT[])
```

#### `user_vinyls`
User's personal vinyl collection with context.
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- vinyl_id (UUID, FK to vinyls)
- story (TEXT) - Personal story about this vinyl
- mood (TEXT) - Emotional tag (warm, nostalgic, etc.)
- is_public (BOOLEAN) - Visibility to others
- acquired_date, purchase_price, condition
- is_favorite, play_count
```

#### `stories`
Long-form stories about vinyls (separate from inline stories).
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- user_vinyl_id (UUID, FK to user_vinyls)
- title, content, mood
- is_public (BOOLEAN)
```

### Social Features

#### `follows`
User following relationships.
```sql
- follower_id (UUID, FK to profiles)
- following_id (UUID, FK to profiles)
- UNIQUE(follower_id, following_id)
```

#### `story_resonances`
Thoughtful engagement with stories (renamed from "likes").
```sql
- user_id (UUID, FK to profiles)
- story_id (UUID, FK to stories)
- UNIQUE(user_id, story_id)
```

#### `comments`
Comments on stories.
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- story_id (UUID, FK to stories)
- content (TEXT)
```

### Collections System

#### `collections`
User-created vinyl playlists/collections.
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- name (TEXT) - e.g., "Late Night Listens"
- description (TEXT)
- mood (TEXT) - Optional mood for entire collection
- cover_vinyl_id (UUID) - Featured vinyl as cover
- is_public (BOOLEAN) - Shareable
- is_collaborative (BOOLEAN) - Allow others to contribute
```

#### `collection_items`
Vinyls within a collection.
```sql
- id (UUID)
- collection_id (UUID, FK to collections)
- user_vinyl_id (UUID, FK to user_vinyls)
- position (INTEGER) - Custom ordering
- note (TEXT) - Why this vinyl belongs here
```

#### `collection_saves`
Users saving/bookmarking collections.
```sql
- user_id (UUID, FK to profiles)
- collection_id (UUID, FK to collections)
- UNIQUE(user_id, collection_id)
```

### Row Level Security (RLS)

All tables use RLS policies for fine-grained access control:
- Users can view their own data
- Public data (is_public = true) is viewable by everyone
- Users can only modify their own data
- Collections can be viewed if public or owned by user

---

## Features

### ✅ Implemented Features

#### 1. **Authentication & Profiles**
- Sign up / Sign in with email
- Auto-create profile on signup
- View user profiles with stats (vinyl count, followers, following)

#### 2. **Vinyl Collection Management**
- Search vinyls via MusicBrainz API
- Add vinyls to personal library
- Attach personal stories to vinyls
- Tag vinyls with moods (warm, nostalgic, night, calm, energy)
- Mark vinyls as public/private
- View own library and other users' public libraries

#### 3. **Collections (Playlists)**
- Create themed collections of vinyls
- Add vinyls to multiple collections with optional notes
- Make collections public/private
- Browse trending collections in feed
- Save/bookmark collections from other users
- View saved collections

#### 4. **Stories & Feed**
- Create stories attached to vinyls
- Discover feed with public stories (limited to 10 for mindful browsing)
- Following tab (placeholder for followed users' stories)
- Collections tab showing trending collections

#### 5. **Thoughtful Engagement (Resonance System)**
- "Resonate" with stories instead of "like"
- Uses 🎵/🎶 icons (not hearts)
- No public count display (prevents toxicity)
- Weekly digest emails instead of instant notifications
- Focus on meaningful connection, not metrics

#### 6. **Social Features**
- Follow/unfollow users
- View follower/following counts
- Comment on stories
- User profiles with bio, stats, library preview

### 🔜 Planned Features

- Collections in user profiles
- Collaborative collections
- Activity feed for followed users
- Search & filters (by mood, genre, year)
- Vinyl statistics & insights
- Weekly resonance digest emails
- Share collections externally
- Vinyl condition tracking
- Play count tracking

---

## Project Structure

```
vinylia/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── feed.tsx             # Discover feed (stories + collections)
│   │   ├── search.tsx           # Search vinyls
│   │   ├── library.tsx          # User's vinyl library
│   │   └── profile.tsx          # User profile
│   ├── auth.tsx                 # Authentication screen
│   ├── user-profile.tsx         # View other users' profiles
│   ├── my-vinyl-detail.tsx      # Vinyl detail (own library)
│   ├── collections.tsx          # Collections management
│   └── collection-detail.tsx    # Collection detail view
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── MoodPill.tsx
│   │   ├── VinylCard.tsx
│   │   ├── CollectionCard.tsx
│   │   ├── ResonanceButton.tsx
│   │   ├── AddToCollectionSheet.tsx
│   │   ├── CreateCollectionModal.tsx
│   │   └── ...
│   │
│   ├── services/                # API & data services
│   │   ├── supabase.ts         # Supabase client
│   │   ├── auth-service.ts     # Authentication
│   │   ├── vinyl-service.ts    # Vinyl CRUD + MusicBrainz
│   │   ├── story-service.ts    # Stories CRUD
│   │   ├── social-service.ts   # Follow, resonance, comments
│   │   └── collection-service.ts # Collections CRUD
│   │
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx     # Auth state management
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAutoSave.ts      # Auto-save with debounce
│   │   └── useToast.ts         # Toast notifications
│   │
│   └── theme/                   # Design system
│       └── index.ts            # Colors, typography, spacing
│
└── assets/                      # Images, fonts, etc.
```

---

## Components

### UI Components

#### **Button**
Primary action button with variants (primary, secondary, outline).
```tsx
<Button
  label="Save"
  onPress={handleSave}
  variant="primary"
  loading={isLoading}
  disabled={false}
/>
```

#### **MoodPill**
Mood selector/tag component.
```tsx
<MoodPill
  mood="warm"
  selected={selectedMood === 'warm'}
  onPress={() => setSelectedMood('warm')}
/>
```

#### **VinylCard**
Grid item displaying vinyl cover + metadata.
```tsx
<VinylCard
  id={vinyl.id}
  coverUrl={vinyl.cover_art_url}
  artist={vinyl.artist}
  album={vinyl.album}
  mood={vinyl.mood}
  onPress={() => navigate(vinyl.id)}
/>
```

#### **CollectionCard**
Displays collection with 3x3 grid preview or compact list item.
```tsx
<CollectionCard
  collection={collection}
  variant="default" // or "compact"
  showCreator={true}
  onPress={() => navigate(collection.id)}
/>
```

#### **ResonanceButton**
Non-toxic engagement button for stories.
```tsx
<ResonanceButton
  hasResonated={hasResonated}
  onPress={handleToggle}
  showLabel={true}
/>
```

#### **AddToCollectionSheet**
Bottom sheet for adding vinyl to collections with notes.
```tsx
<AddToCollectionSheet
  isVisible={showSheet}
  onClose={() => setShowSheet(false)}
  userVinylId={vinylId}
  onCreateCollection={() => setShowCreateModal(true)}
/>
```

#### **CreateCollectionModal**
Full-screen modal for creating/editing collections.
```tsx
<CreateCollectionModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handleCreate}
  initialData={collection} // for editing
  isEditing={false}
/>
```

### Other Components
- **BottomSheet** - Modal bottom sheet
- **EmptyState** - Empty state placeholder
- **SearchBar** - Search input
- **SkeletonLoader** - Loading skeleton
- **StoryTextArea** - Story editor with auto-save
- **Toast** - Toast notifications

---

## Services

### AuthService
```typescript
- signIn(email, password)
- signUp(email, password, displayName)
- signOut()
- getCurrentUser()
- updateProfile(data)
```

### VinylService
```typescript
- searchVinyls(query) - Search MusicBrainz
- getVinylById(id)
- addToLibrary(vinylData)
- removeFromLibrary(userVinylId)
- updateStory(userVinylId, story)
- updateMood(userVinylId, mood)
- getUserLibrary(userId)
```

### StoryService
```typescript
- getDiscoverFeed() - Public stories
- getUserStories(userId)
- createStory(data)
- updateStory(storyId, data)
- deleteStory(storyId)
```

### SocialService
```typescript
- followUser(userId)
- unfollowUser(userId)
- isFollowing(userId)
- getFollowers(userId)
- getFollowing(userId)
- resonateWithStory(storyId)
- unresonateWithStory(storyId)
- getUserResonances() - Returns Set<storyId>
- addComment(storyId, content)
- getComments(storyId)
```

### CollectionService
```typescript
- createCollection(data)
- getUserCollections(userId)
- getCollection(collectionId)
- updateCollection(collectionId, data)
- deleteCollection(collectionId)
- addVinylToCollection(collectionId, userVinylId, note)
- removeVinylFromCollection(collectionItemId)
- reorderCollectionItems(collectionId, itemIds)
- saveCollection(collectionId)
- unsaveCollection(collectionId)
- getSavedCollections()
- getTrendingCollections(limit) - Most saved in last 7 days
- getPublicCollections(limit)
```

---

## Design System

### Colors

```typescript
colors: {
  background: {
    base: '#F5F1E8',      // Warm off-white
    surface: '#FFFFFF',   // Cards, panels
    elevated: '#FAF8F3',  // Subtle elevation
  },
  text: {
    primary: '#2C2416',   // Rich dark brown
    secondary: '#5C5347', // Medium brown
    muted: '#8F8679',     // Light brown
    inverse: '#FFFFFF',   // On dark backgrounds
  },
  interactive: {
    primary: '#8B5E3C',   // Warm brown (main actions)
    secondary: '#A67C52', // Lighter brown
    hover: '#6F4A2F',     // Darker on hover
  },
  mood: {
    warm: '#D97757',      // Warm orange-brown
    nostalgic: '#C89F7A', // Sepia tan
    night: '#4A5568',     // Cool slate
    calm: '#7BA0B4',      // Soft blue-gray
    energy: '#E85D75',    // Vibrant coral
  },
  states: {
    success: '#6B9F71',
    warning: '#D9A34A',
    error: '#C5685F',
  },
  divider: {
    light: '#E8E3D8',
    medium: '#D4CDBF',
  },
}
```

### Typography

```typescript
typography: {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
}
```

### Spacing

```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}
```

### Border Radius

```typescript
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

---

## Migration History

### Initial Schema
Created base tables for vinyl collection app:
- profiles, vinyls, user_vinyls, tags
- stories, follows, likes, comments
- RLS policies for all tables
- Triggers for updated_at timestamps
- Auto-create profile on signup

### Migration 1: Story & Mood System
**File**: `database-migration-add-story-mood.sql`

Added columns to `user_vinyls`:
- `story` (TEXT) - Personal story about the vinyl
- `mood` (TEXT) - Emotional mood tag
- `is_public` (BOOLEAN) - Visibility control

**Purpose**: Allow users to attach personal context to each vinyl in their library, making it more than just a catalog.

### Migration 2: Fix RLS Policies
**File**: `database-migration-fix-rls-policies-v2.sql`

Fixed Row Level Security policies on `user_vinyls`:
- Added policy: "Users can view public vinyls from others"
- Updated existing policy for own vinyls
- Made idempotent (can run multiple times)

**Issue Fixed**: Users couldn't view other users' libraries because RLS blocked all access except own vinyls.

### Migration 3: Collections & Resonance System
**File**: `database-migration-collections-resonance.sql`

Created new tables:
- `collections` - Vinyl playlists/collections
- `collection_items` - Vinyls in collections with notes
- `collection_saves` - Save/bookmark collections
- Renamed `likes` → `story_resonances` (thoughtful engagement)

Added views:
- `collections_with_stats` - Collections with vinyl count, save count
- `user_saved_collections` - User's bookmarked collections

**Purpose**: Enable users to create themed vinyl collections and engage with stories in a non-toxic way.

### Database Setup Instructions

To set up the database from scratch:

1. Create a new Supabase project
2. Run the base schema (all tables from original schema)
3. Run the complete migration:
   ```sql
   -- Add story, mood, is_public to user_vinyls
   ALTER TABLE public.user_vinyls
   ADD COLUMN IF NOT EXISTS story TEXT,
   ADD COLUMN IF NOT EXISTS mood TEXT,
   ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

   -- Fix RLS policies
   DROP POLICY IF EXISTS "Users can view their own vinyls" ON public.user_vinyls;
   DROP POLICY IF EXISTS "Users can view public vinyls from others" ON public.user_vinyls;

   CREATE POLICY "Users can view their own vinyls"
     ON public.user_vinyls FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can view public vinyls from others"
     ON public.user_vinyls FOR SELECT
     USING (is_public = true);
   ```
4. Run the collections & resonance migration (full SQL from migration file)

All migrations are idempotent and can be safely re-run.

---

## Environment Setup

### Required Environment Variables

Create `.env` file in project root:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

---

## Key Design Decisions

### 1. Resonance vs Likes
**Decision**: Use "resonance" instead of "likes" with no public counts.

**Reasoning**:
- Reduces social comparison and anxiety
- Encourages thoughtful engagement
- Focuses on personal connection, not metrics
- Weekly digests prevent dopamine-driven behavior

### 2. Collections Instead of Playlists
**Decision**: Call them "collections" not "playlists".

**Reasoning**:
- Better fits vinyl collecting culture
- More personal and curatorial feel
- Evokes physical collection organization
- Differentiates from music streaming apps

### 3. Limited Feed (10 Stories)
**Decision**: Cap discover feed at 10 stories per session.

**Reasoning**:
- Prevents endless scrolling
- Encourages mindful discovery
- Respects users' time and attention
- Promotes quality over quantity

### 4. Mood-Based Organization
**Decision**: Use mood tags (warm, nostalgic, night, calm, energy) instead of genres.

**Reasoning**:
- More personal and emotional connection
- Better reflects how people actually experience music
- More useful for collection curation
- Unique to vinyl listening experience

### 5. Story-First Approach
**Decision**: Emphasize personal stories over specs and ratings.

**Reasoning**:
- Vinyls are about memories and experiences
- Differentiates from Discogs (catalog-focused)
- Creates emotional connection
- Encourages community storytelling

---

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React hooks best practices
- Use TanStack Query for all data fetching
- Keep components small and focused
- Extract reusable logic to hooks
- Use the design system (no hardcoded colors/spacing)

### Component Guidelines
- Import specific components, not barrel exports (avoid circular deps)
- Use proper accessibility labels
- Handle loading and error states
- Optimize for performance (memoization where needed)

### Database Guidelines
- Always use RLS policies for security
- Make migrations idempotent
- Add indexes for frequently queried columns
- Document complex queries with comments
- Use views for commonly joined data

---

## License

Proprietary - All rights reserved

---

**Built with ❤️ for vinyl collectors who value stories over stats.**
