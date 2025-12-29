import { supabase } from './supabase';

export const socialService = {
  // Follow a user
  async followUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Unfollow a user
  async unfollowUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  // Get followers
  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('follower:profiles(*)')
      .eq('following_id', userId);

    if (error) throw error;
    return data?.map(f => f.follower) || [];
  },

  // Get following
  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('following:profiles(*)')
      .eq('follower_id', userId);

    if (error) throw error;
    return data?.map(f => f.following) || [];
  },

  // Check if current user is following another user
  async isFollowing(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    return !!data;
  },

  // Get follower and following counts
  async getFollowCounts(userId: string) {
    const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ]);

    return {
      followers: followerCount || 0,
      following: followingCount || 0,
    };
  },

  // Get user profile with stats
  async getUserProfile(userId: string) {
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get vinyl count
    const { count: vinylCount } = await supabase
      .from('user_vinyls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get story count (public only)
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_public', true);

    // Get follow counts
    const followCounts = await this.getFollowCounts(userId);

    return {
      ...profile,
      vinyl_count: vinylCount || 0,
      story_count: storyCount || 0,
      ...followCounts,
    };
  },

  // Get user's library
  // Returns all vinyls if viewing own profile, only public vinyls if viewing others
  async getUserLibrary(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.id === userId;

    const query = supabase
      .from('user_vinyls')
      .select(`
        *,
        vinyl:vinyls(*),
        tags(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    // If viewing someone else's profile, only show public vinyls
    if (!isOwnProfile) {
      query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get user's stories (public only)
  async getUserStories(userId: string) {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:profiles(*),
        user_vinyl:user_vinyls(*, vinyl:vinyls(*))
      `)
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get like and comment counts for each story
    const storiesWithCounts = await Promise.all(
      (data || []).map(async (story) => {
        const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
          supabase.from('likes').select('*', { count: 'exact', head: true }).eq('story_id', story.id),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('story_id', story.id),
        ]);

        return {
          ...story,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
        };
      })
    );

    return storiesWithCounts;
  },

  // Resonate with a story (thoughtful engagement, not toxic likes)
  async resonateWithStory(storyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try both table names for backwards compatibility
    let tableName = 'story_resonances';
    let { data, error } = await supabase
      .from(tableName)
      .insert({
        user_id: user.id,
        story_id: storyId,
      })
      .select()
      .single();

    // Fallback to old 'likes' table if resonances doesn't exist yet
    if (error && error.code === '42P01') {
      tableName = 'likes';
      ({ data, error } = await supabase
        .from(tableName)
        .insert({
          user_id: user.id,
          story_id: storyId,
        })
        .select()
        .single());
    }

    if (error) throw error;
    return data;
  },

  // Remove resonance from a story
  async unresonateWithStory(storyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try both table names
    let { error } = await supabase
      .from('story_resonances')
      .delete()
      .eq('user_id', user.id)
      .eq('story_id', storyId);

    // Fallback to old 'likes' table
    if (error && error.code === '42P01') {
      ({ error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId));
    }

    if (error) throw error;
  },

  // Check if user resonated with a story
  async hasResonatedWithStory(storyId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Try both table names
    let { data } = await supabase
      .from('story_resonances')
      .select('id')
      .eq('user_id', user.id)
      .eq('story_id', storyId)
      .single();

    // Fallback to old 'likes' table
    if (!data) {
      ({ data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single());
    }

    return !!data;
  },

  // Get all story IDs the user has resonated with (for efficient checking)
  async getUserResonances(): Promise<Set<string>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();

    // Try both table names
    let { data } = await supabase
      .from('story_resonances')
      .select('story_id')
      .eq('user_id', user.id);

    // Fallback to old 'likes' table
    if (!data || data.length === 0) {
      ({ data } = await supabase
        .from('likes')
        .select('story_id')
        .eq('user_id', user.id));
    }

    return new Set((data || []).map(r => r.story_id));
  },

  // Legacy aliases for backwards compatibility
  async likeStory(storyId: string) {
    return this.resonateWithStory(storyId);
  },

  async unlikeStory(storyId: string) {
    return this.unresonateWithStory(storyId);
  },

  async hasLikedStory(storyId: string) {
    return this.hasResonatedWithStory(storyId);
  },

  // Add comment
  async addComment(storyId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        story_id: storyId,
        content,
      })
      .select('*, user:profiles(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Get comments for a story
  async getComments(storyId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:profiles(*)')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Delete comment
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },
};
