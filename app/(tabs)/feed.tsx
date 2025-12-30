import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storyService } from '@/services/story-service';
import { socialService } from '@/services/social-service';
import { collectionService } from '@/services/collection-service';
import { EmptyState, ResonanceButton, CollectionCard } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';

type FeedTab = 'following' | 'discover' | 'collections';

export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Stories query
  const { data: stories = [], isLoading, error } = useQuery({
    queryKey: ['feed', activeTab],
    queryFn: () => storyService.getDiscoverFeed(),
    enabled: activeTab === 'following' || activeTab === 'discover',
    select: (data) => data.slice(0, 10),
    staleTime: 2 * 60 * 1000, // 2 minutes - fresh content
  });

  // Collections query
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ['trendingCollections'],
    queryFn: () => collectionService.getTrendingCollections(20),
    enabled: activeTab === 'collections',
    staleTime: 30 * 60 * 1000, // 30 minutes - trending changes slowly
  });

  // User's resonances query
  const { data: resonances = new Set<string>() } = useQuery({
    queryKey: ['userResonances'],
    queryFn: () => socialService.getUserResonances(),
    enabled: activeTab === 'following' || activeTab === 'discover',
  });

  // Resonance mutation with optimistic updates
  const resonanceMutation = useMutation({
    mutationFn: async ({ storyId, hasResonated }: { storyId: string; hasResonated: boolean }) => {
      if (hasResonated) {
        await socialService.unresonateWithStory(storyId);
      } else {
        await socialService.resonateWithStory(storyId);
      }
    },
    onMutate: async ({ storyId, hasResonated }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userResonances'] });

      // Snapshot previous value
      const previousResonances = queryClient.getQueryData(['userResonances']);

      // Optimistically update
      queryClient.setQueryData(['userResonances'], (old: Set<string>) => {
        const newSet = new Set(old);
        if (hasResonated) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });

      return { previousResonances };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousResonances) {
        queryClient.setQueryData(['userResonances'], context.previousResonances);
      }
    },
    onSettled: () => {
      // Only invalidate specific tab, not all feeds
      queryClient.invalidateQueries({ queryKey: ['feed', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['userResonances'] });
    },
  });

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: '/user-profile',
      params: { userId },
    });
  };

  const renderStory = ({ item, index }: any) => (
    <View style={styles.storyCard}>
      {/* User Header */}
      <TouchableOpacity
        style={styles.storyHeader}
        onPress={() => handleUserPress(item.user_id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.display_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>
            {item.user?.display_name || 'Vinyl Collector'}
          </Text>
          <Text style={styles.timestamp}>
            {item.user?.username ? `@${item.user.username}` : '2 hours ago'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Vinyl Cover */}
      {item.user_vinyl?.vinyl?.cover_art_url && (
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: item.user_vinyl.vinyl.cover_art_url }}
            style={styles.vinylCover}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Story Content */}
      <View style={styles.storyContent}>
        <Text style={styles.vinylArtist}>{item.user_vinyl?.vinyl?.artist}</Text>
        <Text style={styles.vinylAlbum}>{item.user_vinyl?.vinyl?.album}</Text>

        <Text style={styles.storyText} numberOfLines={3}>
          {item.content || item.user_vinyl?.story}
        </Text>

        <TouchableOpacity>
          <Text style={styles.readMore}>Read More</Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.storyActions}>
          <ResonanceButton
            hasResonated={resonances.has(item.id)}
            onPress={() => resonanceMutation.mutate({
              storyId: item.id,
              hasResonated: resonances.has(item.id)
            })}
            disabled={resonanceMutation.isPending}
          />
          {item.mood && (
            <View style={[styles.moodDot, { backgroundColor: colors.mood[item.mood as keyof typeof colors.mood] || colors.mood.warm }]} />
          )}
        </View>
      </View>
    </View>
  );

  const tabs = [
    { id: 'following' as const, label: 'Following' },
    { id: 'discover' as const, label: 'Discover' },
    { id: 'collections' as const, label: 'Collections' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                activeTab === tab.id && styles.filterPillActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeTab === tab.id && styles.filterTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'collections' ? (
        // Collections Tab
        isLoadingCollections ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.interactive.primary} />
          </View>
        ) : collections.length === 0 ? (
          <EmptyState
            icon="📑"
            heading="No collections yet"
            body="Discover curated vinyl collections from the community"
          />
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <CollectionCard
                collection={item}
                showCreator
                onPress={() => router.push({
                  pathname: '/collection-detail',
                  params: { collectionId: item.id },
                })}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        // Stories Tabs (Following & Discover)
        error ? (
          <EmptyState
            icon="⚠️"
            heading="Error loading stories"
            body="Failed to load the discover feed. Please try again."
          />
        ) : stories.length === 0 && !isLoading ? (
          <EmptyState
            icon="🌍"
            heading="No stories yet"
            body="Be the first to share a vinyl story!"
          />
        ) : (
          <FlatList
            data={stories}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderStory}
            refreshing={isLoading}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              stories.length > 0 ? (
                <View style={styles.endMessage}>
                  <Text style={styles.endText}>You've reached the end</Text>
                  <Text style={styles.endSubtext}>
                    Limited to 10 stories for mindful discovery
                  </Text>
                </View>
              ) : null
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  tabsContainer: {
    paddingBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.divider.light,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.interactive.primary,
    borderWidth: 0,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  storyCard: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: 2,
  },
  coverContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  vinylCover: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
  },
  storyContent: {
    padding: spacing.lg,
  },
  vinylArtist: {
    ...typography.body,
    color: colors.text.secondary,
  },
  vinylAlbum: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  storyText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    lineHeight: 28,
  },
  readMore: {
    ...typography.body,
    color: colors.interactive.primary,
    marginTop: spacing.sm,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.interactive.primary,
    fontWeight: '600',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  endMessage: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  endText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  endSubtext: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
