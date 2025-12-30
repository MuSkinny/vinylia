import { supabase } from './supabase';

export const collectionService = {
  // ============================================================================
  // COLLECTIONS CRUD
  // ============================================================================

  // Create a new collection
  async createCollection(data: {
    name: string;
    description?: string;
    mood?: string;
    isPublic?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        mood: data.mood,
        is_public: data.isPublic ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return collection;
  },

  // Get user's collections
  async getUserCollections(userId: string) {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        items:collection_items(
          *,
          user_vinyl:user_vinyls(
            *,
            vinyl:vinyls(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to add vinyl_count
    return (data || []).map((collection: any) => ({
      ...collection,
      vinyl_count: collection.items?.length || 0,
    }));
  },

  // Get single collection with all vinyls
  async getCollection(collectionId: string) {
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('id', collectionId)
      .single();

    if (collectionError) throw collectionError;

    // Get vinyls in collection
    const { data: items, error: itemsError } = await supabase
      .from('collection_items')
      .select(`
        *,
        user_vinyl:user_vinyls(
          *,
          vinyl:vinyls(*)
        )
      `)
      .eq('collection_id', collectionId)
      .order('position', { ascending: true });

    if (itemsError) throw itemsError;

    // Get save count
    const { count: saveCount } = await supabase
      .from('collection_saves')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    // Check if current user saved it
    const { data: { user } } = await supabase.auth.getUser();
    let isSaved = false;
    if (user) {
      const { data: save } = await supabase
        .from('collection_saves')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .single();
      isSaved = !!save;
    }

    return {
      ...collection,
      items: items || [],
      save_count: saveCount || 0,
      is_saved: isSaved,
    };
  },

  // Update collection
  async updateCollection(
    collectionId: string,
    updates: {
      name?: string;
      description?: string;
      mood?: string;
      isPublic?: boolean;
      coverVinylId?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('collections')
      .update({
        name: updates.name,
        description: updates.description,
        mood: updates.mood,
        is_public: updates.isPublic,
        cover_vinyl_id: updates.coverVinylId,
      })
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete collection
  async deleteCollection(collectionId: string) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;
  },

  // ============================================================================
  // COLLECTION ITEMS
  // ============================================================================

  // Add vinyl to collection
  async addVinylToCollection(
    collectionId: string,
    userVinylId: string,
    note?: string
  ) {
    // Get current max position
    const { data: items } = await supabase
      .from('collection_items')
      .select('position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: false })
      .limit(1);

    const maxPosition = items?.[0]?.position ?? -1;

    const { data, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        user_vinyl_id: userVinylId,
        position: maxPosition + 1,
        note,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove vinyl from collection
  async removeVinylFromCollection(collectionItemId: string) {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', collectionItemId);

    if (error) throw error;
  },

  // Update collection item note
  async updateCollectionItemNote(collectionItemId: string, note: string) {
    const { data, error } = await supabase
      .from('collection_items')
      .update({ note })
      .eq('id', collectionItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reorder vinyls in collection
  async reorderCollectionItems(
    collectionId: string,
    itemIds: string[] // Array of collection_item IDs in new order
  ) {
    const updates = itemIds.map((id, index) => ({
      id,
      position: index,
    }));

    // Update positions in batch
    const promises = updates.map(({ id, position }) =>
      supabase
        .from('collection_items')
        .update({ position })
        .eq('id', id)
    );

    await Promise.all(promises);
  },

  // ============================================================================
  // COLLECTION SAVES (Bookmarking)
  // ============================================================================

  // Save/bookmark a collection
  async saveCollection(collectionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('collection_saves')
      .insert({
        user_id: user.id,
        collection_id: collectionId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Unsave/unbookmark a collection
  async unsaveCollection(collectionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('collection_saves')
      .delete()
      .eq('user_id', user.id)
      .eq('collection_id', collectionId);

    if (error) throw error;
  },

  // Get user's saved collections
  async getSavedCollections() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('collection_saves')
      .select(`
        *,
        collection:collections(
          *,
          user:profiles(*),
          collection_items(count)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(save => save.collection) || [];
  },

  // Check if user saved a collection
  async hasSavedCollection(collectionId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('collection_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('collection_id', collectionId)
      .single();

    return !!data;
  },

  // ============================================================================
  // DISCOVERY
  // ============================================================================

  // Get public collections (for explore feed)
  async getPublicCollections(limit: number = 20) {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        user:profiles(*),
        items:collection_items(
          *,
          user_vinyl:user_vinyls(
            *,
            vinyl:vinyls(*)
          )
        ),
        saves:collection_save_counts(save_count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // For current user's saved status, do ONE query
    let userSavedCollectionIds = new Set<string>();
    if (user && data && data.length > 0) {
      const { data: userSaves } = await supabase
        .from('collection_saves')
        .select('collection_id')
        .eq('user_id', user.id)
        .in('collection_id', data.map(c => c.id));
      userSavedCollectionIds = new Set((userSaves || []).map(s => s.collection_id));
    }

    // Map with pre-fetched data
    const collectionsWithStats = (data || []).map((collection: any) => ({
      ...collection,
      vinyl_count: collection.items?.length || 0,
      save_count: collection.saves?.save_count || 0,
      is_saved: userSavedCollectionIds.has(collection.id),
    }));

    return collectionsWithStats;
  },

  // Get collections by mood
  async getCollectionsByMood(mood: string) {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        user:profiles(*),
        items:collection_items(
          *,
          user_vinyl:user_vinyls(
            *,
            vinyl:vinyls(*)
          )
        )
      `)
      .eq('is_public', true)
      .eq('mood', mood)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add vinyl_count to each collection
    return (data || []).map(collection => ({
      ...collection,
      vinyl_count: collection.items?.length || 0,
    }));
  },

  // Get trending collections (most saved recently)
  async getTrendingCollections(limit: number = 10) {
    // Always fallback to public collections for now
    // TODO: Implement trending logic once we have more saves
    console.log('Loading public collections as trending...');
    return this.getPublicCollections(limit);

    /* Original trending logic - restore when you have save activity
    // Get collections saved in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentSaves, error: savesError } = await supabase
      .from('collection_saves')
      .select('collection_id')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (savesError) throw savesError;

    // Count saves per collection
    const saveCounts = (recentSaves || []).reduce((acc, save) => {
      acc[save.collection_id] = (acc[save.collection_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top collection IDs
    const topCollectionIds = Object.entries(saveCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (topCollectionIds.length === 0) {
      // Fallback to recent public collections
      return this.getPublicCollections(limit);
    }

    // Fetch collection details with vinyl data
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        user:profiles(*),
        items:collection_items(
          *,
          user_vinyl:user_vinyls(
            *,
            vinyl:vinyls(*)
          )
        ),
        saves:collection_save_counts(save_count)
      `)
      .in('id', topCollectionIds)
      .eq('is_public', true);

    if (error) throw error;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // For current user's saved status, do ONE query
    let userSavedCollectionIds = new Set<string>();
    if (user && data && data.length > 0) {
      const { data: userSaves } = await supabase
        .from('collection_saves')
        .select('collection_id')
        .eq('user_id', user.id)
        .in('collection_id', data.map(c => c.id));
      userSavedCollectionIds = new Set((userSaves || []).map(s => s.collection_id));
    }

    // Map with pre-fetched data
    const collectionsWithStats = (data || []).map((collection: any) => ({
      ...collection,
      vinyl_count: collection.items?.length || 0,
      save_count: saveCounts[collection.id] || 0,
      is_saved: userSavedCollectionIds.has(collection.id),
    }));

    return collectionsWithStats;
    */
  },
};
