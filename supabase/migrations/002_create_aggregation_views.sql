-- ============================================================================
-- Vinylia Production Optimization: Aggregation Views and Indexes
-- Purpose: Eliminate N+1 queries by pre-aggregating counts
-- Phase 1: Indexes and safe views only
-- ============================================================================

-- ============================================================================
-- PERFORMANCE INDEXES FOR EXISTING TABLES
-- ============================================================================

-- Indexes for collection queries
CREATE INDEX IF NOT EXISTS idx_collection_saves_collection_id
ON collection_saves(collection_id);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_position
ON collection_items(collection_id, position);

-- Indexes for user vinyl queries
CREATE INDEX IF NOT EXISTS idx_user_vinyls_user_added
ON user_vinyls(user_id, added_at DESC);

-- Indexes for follow queries
CREATE INDEX IF NOT EXISTS idx_follows_following_id
ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id
ON follows(follower_id);

-- Indexes for story queries
CREATE INDEX IF NOT EXISTS idx_stories_user_public
ON stories(user_id, is_public, created_at DESC);

-- ============================================================================
-- VIEWS FOR AGGREGATED COUNTS (ONLY GUARANTEED TABLES)
-- ============================================================================

-- Collection save counts view (eliminates N+1 in collection queries)
CREATE OR REPLACE VIEW collection_save_counts AS
SELECT
  c.id as collection_id,
  COALESCE(cs.save_count, 0) as save_count
FROM collections c
LEFT JOIN (
  SELECT collection_id, COUNT(*) as save_count
  FROM collection_saves
  GROUP BY collection_id
) cs ON c.id = cs.collection_id;

-- User stats view (consolidates profile queries)
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id as user_id,
  COALESCE(v.vinyl_count, 0) as vinyl_count,
  COALESCE(s.story_count, 0) as story_count,
  COALESCE(followers.count, 0) as follower_count,
  COALESCE(following.count, 0) as following_count
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as vinyl_count
  FROM user_vinyls
  GROUP BY user_id
) v ON p.id = v.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as story_count
  FROM stories
  WHERE is_public = true
  GROUP BY user_id
) s ON p.id = s.user_id
LEFT JOIN (
  SELECT following_id, COUNT(*) as count
  FROM follows
  GROUP BY following_id
) followers ON p.id = followers.following_id
LEFT JOIN (
  SELECT follower_id, COUNT(*) as count
  FROM follows
  GROUP BY follower_id
) following ON p.id = following.follower_id;

-- ============================================================================
-- STORY ENGAGEMENT VIEW (REQUIRES story_resonances TABLE)
-- Only uncomment this after creating the story_resonances table
-- ============================================================================

/*
-- First create the story_resonances table if it doesn't exist:
CREATE TABLE IF NOT EXISTS story_resonances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_resonances_story_id
ON story_resonances(story_id);

CREATE INDEX IF NOT EXISTS idx_story_resonances_user_id
ON story_resonances(user_id);

-- Then create the view:
CREATE OR REPLACE VIEW story_engagement_counts AS
SELECT
  s.id as story_id,
  COALESCE(r.resonance_count, 0) as like_count,
  0 as comment_count
FROM stories s
LEFT JOIN (
  SELECT story_id, COUNT(*) as resonance_count
  FROM story_resonances
  GROUP BY story_id
) r ON s.id = r.story_id;
*/

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON collection_save_counts TO authenticated;
GRANT SELECT ON user_stats TO authenticated;
-- GRANT SELECT ON story_engagement_counts TO authenticated; -- Uncomment when view is created
