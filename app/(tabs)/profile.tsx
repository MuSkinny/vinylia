import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { vinylService } from '@/services/vinyl-service';
import { collectionService } from '@/services/collection-service';
import { VinylCard, CollectionCard } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MoodType } from '@/theme';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();

  const { data: library = [] } = useQuery({
    queryKey: ['library', user?.id],
    queryFn: () => vinylService.getUserLibrary(user!.id),
    enabled: !!user,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['myCollections', user?.id],
    queryFn: () => collectionService.getUserCollections(user!.id),
    enabled: !!user,
  });

  const { showToast } = useToast();

  // Transform library data
  const vinyls = library.map((item: any) => ({
    id: item.id,
    coverUrl: item.vinyl?.cover_art_thumb_url || item.vinyl?.cover_art_url || '',
    artist: item.vinyl?.artist || 'Unknown Artist',
    album: item.vinyl?.album || 'Unknown Album',
    mood: item.mood as MoodType | undefined,
  }));

  const handleVinylPress = (id: string) => {
    router.push({
      pathname: '/my-vinyl-detail',
      params: { userVinylId: id },
    });
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out successfully', 'success');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Settings size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.display_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={styles.displayName}>
            {profile?.display_name || 'Your Name'}
          </Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          <Text style={styles.libraryCount}>{vinyls.length} records in your library</Text>
        </View>

        <View style={styles.divider} />

        {/* Library Preview */}
        <View style={styles.librarySection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.push('/(tabs)')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View full library"
          >
            <Text style={styles.sectionTitle}>Your Library</Text>
            {vinyls.length > 0 && (
              <Text style={styles.viewAllText}>View All</Text>
            )}
          </TouchableOpacity>

          {vinyls.length > 0 ? (
            <View style={styles.vinylPreviewGrid}>
              {vinyls.slice(0, 6).map((vinyl) => (
                <View key={vinyl.id} style={styles.vinylPreviewItem}>
                  <VinylCard
                    id={vinyl.id}
                    coverUrl={vinyl.coverUrl}
                    artist={vinyl.artist}
                    album={vinyl.album}
                    mood={vinyl.mood}
                    onPress={() => handleVinylPress(vinyl.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLibrary}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>No records yet</Text>
              <Text style={styles.emptySubtext}>
                Start building your vinyl library
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.emptyButtonText}>Add Your First Record</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Collections Section */}
        <View style={styles.librarySection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.push('/collections')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View all collections"
          >
            <Text style={styles.sectionTitle}>Collections</Text>
            {collections.length > 0 && (
              <Text style={styles.viewAllText}>View All</Text>
            )}
          </TouchableOpacity>

          {collections.length > 0 ? (
            <View style={styles.collectionsPreview}>
              {collections.slice(0, 3).map((collection: any) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onPress={() =>
                    router.push({
                      pathname: '/collection-detail',
                      params: { collectionId: collection.id },
                    })
                  }
                  variant="compact"
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyLibrary}>
              <Text style={styles.emptyIcon}>📑</Text>
              <Text style={styles.emptyText}>No collections yet</Text>
              <Text style={styles.emptySubtext}>
                Organize your vinyls by mood or meaning
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/collections')}
              >
                <Text style={styles.emptyButtonText}>Create Your First Collection</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitleSmall}>Account</Text>
          <View style={styles.dividerThin} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Email Preferences</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <Text style={styles.sectionTitleSmall}>Privacy</Text>
          <View style={styles.dividerThin} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Library Visibility</Text>
            <Text style={styles.menuValue}>Public</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Story Sharing</Text>
            <Text style={styles.menuValue}>On</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <Text style={styles.sectionTitleSmall}>About</Text>
          <View style={styles.dividerThin} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>About Vinylia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  iconButton: {
    padding: spacing.sm,
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
  libraryCount: {
    ...typography.body,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider.light,
    marginHorizontal: spacing.lg,
  },
  dividerThin: {
    height: 1,
    backgroundColor: colors.divider.light,
    marginBottom: spacing.sm,
  },
  librarySection: {
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.interactive.primary,
    fontWeight: '600',
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
  collectionsPreview: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitleSmall: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontWeight: '500',
    marginBottom: spacing.sm,
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
  emptyButton: {
    backgroundColor: colors.interactive.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text.primary,
  },
  menuValue: {
    ...typography.body,
    color: colors.text.muted,
  },
  spacer: {
    height: spacing.lg,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.divider.light,
    padding: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    ...typography.body,
    color: colors.states.error,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
