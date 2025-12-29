import { supabase } from './supabase';
import type { Story } from '@/types/database';

export const storyService = {
  // Create a story
  async createStory(data: {
    user_vinyl_id: string;
    title?: string;
    content: string;
    mood?: string;
    is_public?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Creating story with data:', { user_id: user.id, ...data });

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select(`
        *,
        user:profiles(*),
        user_vinyl:user_vinyls(*, vinyl:vinyls(*))
      `)
      .single();

    if (error) {
      console.error('Story creation error:', error);
      throw error;
    }

    console.log('Story created successfully:', story.id);
    return story;
  },

  // Get feed (stories from followed users - "Following" tab)
  async getFeed(page: number = 1, limit: number = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get users that current user follows
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = following?.map(f => f.following_id) || [];

    if (followingIds.length === 0) {
      return []; // Return empty if not following anyone
    }

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:profiles(*),
        user_vinyl:user_vinyls(*, vinyl:vinyls(*))
      `)
      .in('user_id', followingIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

  // Get discover feed (all public stories - "Discover" tab)
  async getDiscoverFeed(page: number = 1, limit: number = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:profiles(*),
        user_vinyl:user_vinyls(*, vinyl:vinyls(*))
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Discover feed query error:', error);
      throw error;
    }

    console.log(`Loaded ${data?.length || 0} stories for discover feed`);

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

  // Get single story
  async getStory(storyId: string) {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:profiles(*),
        user_vinyl:user_vinyls(*, vinyl:vinyls(*))
      `)
      .eq('id', storyId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update story
  async updateStory(storyId: string, updates: Partial<Story>) {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete story
  async deleteStory(storyId: string) {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;
  },

  // Get stories for a user vinyl
  async getStoriesForVinyl(userVinylId: string) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_vinyl_id', userVinylId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
