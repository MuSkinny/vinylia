import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { socialService } from '@/services/social-service';
import { useAuth } from '@/contexts/AuthContext';
import { VinylCard, EmptyState, Button } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MoodType } from '@/theme';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'library' | 'stories'>('library');

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => socialService.getUserProfile(userId!),
    enabled: !!userId,
  });

  // Fetch library
  const { data: library = [] } = useQuery({
    queryKey: ['userLibrary', userId],
    queryFn: () => socialService.getUserLibrary(userId!),
    enabled: !!userId && activeTab === 'library',
  });

  // Fetch stories
  const { data: stories = [] } = useQuery({
    queryKey: ['userStories', userId],
    queryFn: () => socialService.getUserStories(userId!),
    enabled: !!userId && activeTab === 'stories',
  });

  // Check if following
  const { data: isFollowing = false } = useQuery({
    queryKey: ['isFollowing', userId],
    queryFn: () => socialService.isFollowing(userId!),
    enabled: !!userId && userId !== user?.id,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (followingId: string) => socialService.followUser(followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      showToast('Following', 'success');
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (followingId: string) => socialService.unfollowUser(followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      showToast('Unfollowed', 'success');
    },
  });

  const handleFollowToggle = () => {
    if (!userId) return;
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="😔"
          heading="User not found"
          body="This profile doesn't exist or is no longer available"
        />
      </SafeAreaView>
    );
  }

  const isOwnProfile = userId === user?.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={styles.displayName}>{profile.display_name || 'Vinyl Collector'}</Text>
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <Text style={styles.libraryCount}>{library.length} records in library</Text>

          {/* Follow Button */}
          {!isOwnProfile && (
            <View style={styles.followContainer}>
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                label={
                  followMutation.isPending || unfollowMutation.isPending
                    ? 'Loading...'
                    : isFollowing
                    ? 'Following'
                    : 'Follow'
                }
                onPress={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                style={styles.followButton}
              />
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'library' && styles.activeTab]}
            onPress={() => setActiveTab('library')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'library' }}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
            onPress={() => setActiveTab('stories')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'stories' }}
          >
            <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>
              Stories
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'library' ? (
          library.length === 0 ? (
            <View style={styles.emptyLibrary}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>
                {isOwnProfile ? 'Your library is private' : 'No public vinyls yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isOwnProfile ? 'Only you can see your collection' : 'Nothing shared yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.vinylPreviewGrid}>
              {library.map((item: any) => (
                <View key={item.id} style={styles.vinylPreviewItem}>
                  <VinylCard
                    id={item.id}
                    coverUrl={item.vinyl?.cover_art_thumb_url || item.vinyl?.cover_art_url || ''}
                    artist={item.vinyl?.artist || 'Unknown Artist'}
                    album={item.vinyl?.album || 'Unknown Album'}
                    mood={item.mood as MoodType | undefined}
                    onPress={() => {
                      // Navigate to vinyl detail or story
                    }}
                  />
                </View>
              ))}
            </View>
          )
        ) : stories.length === 0 ? (
          <View style={styles.emptyLibrary}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No stories yet</Text>
            <Text style={styles.emptySubtext}>
              {isOwnProfile ? 'Share your first story' : 'Nothing shared yet'}
            </Text>
          </View>
        ) : (
          <View style={styles.storiesContainer}>
            {stories.map((story: any) => (
              <View key={story.id} style={styles.storyCard}>
                <View style={styles.storyHeader}>
                  <Text style={styles.storyArtist}>{story.user_vinyl?.vinyl?.artist || 'Unknown Artist'}</Text>
                  <Text style={styles.storyAlbum}>{story.user_vinyl?.vinyl?.album || 'Unknown Album'}</Text>
                </View>
                <Text style={styles.storyText} numberOfLines={4}>
                  {story.content || story.user_vinyl?.story}
                </Text>
                {story.mood && (
                  <View style={styles.storyMoodContainer}>
                    <View style={[styles.moodDot, { backgroundColor: colors.mood[story.mood as keyof typeof colors.mood] || colors.mood.warm }]} />
                    <Text style={styles.storyMood}>{story.mood}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.text.muted,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.divider.light,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text.secondary,
  },
  displayName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  username: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  bio: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  libraryCount: {
    ...typography.body,
    color: colors.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  followContainer: {
    marginTop: spacing.md,
  },
  followButton: {
    backgroundColor: colors.interactive.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    minWidth: 120,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  followButtonText: {
    ...typography.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider.light,
    marginHorizontal: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.interactive.primary,
  },
  tabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.muted,
  },
  activeTabText: {
    color: colors.interactive.primary,
  },
  emptyLibrary: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  vinylPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  vinylPreviewItem: {
    width: '47%',
  },
  vinylCard: {
    width: '47%',
  },
  vinylCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.surface,
  },
  vinylInfo: {
    marginTop: spacing.sm,
  },
  vinylArtist: {
    ...typography.caption,
    color: colors.text.muted,
  },
  vinylAlbum: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  storiesContainer: {
    padding: spacing.lg,
  },
  storyCard: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  storyHeader: {
    marginBottom: spacing.md,
  },
  storyCover: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.base,
  },
  storyContent: {
    padding: spacing.lg,
  },
  storyArtist: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  storyAlbum: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  storyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  storyText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    lineHeight: 28,
  },
  storyMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  storyMood: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textTransform: 'capitalize',
  },
  storyFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.divider.light,
    paddingTop: spacing.md,
  },
  storyStats: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  bottomPadding: {
    height: 100,
  },
});
