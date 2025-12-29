import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MoreVertical, Bookmark, BookmarkCheck, Trash2, Edit } from 'lucide-react-native';
import { collectionService } from '@/services/collection-service';
import { useAuth } from '@/contexts/AuthContext';
import { VinylCard, EmptyState, Button, BottomSheet, CreateCollectionModal } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MoodType } from '@/theme';

export default function CollectionDetailScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch collection details
  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionService.getCollection(collectionId!),
    enabled: !!collectionId,
  });

  const isOwner = collection?.user_id === user?.id;
  const isSaved = collection?.is_saved || false;

  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: (save: boolean) =>
      save
        ? collectionService.saveCollection(collectionId!)
        : collectionService.unsaveCollection(collectionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['savedCollections'] });
      showToast(isSaved ? 'Removed from saved' : 'Saved!', 'success');
    },
  });

  // Update collection mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      mood?: string;
      isPublic: boolean;
    }) =>
      collectionService.updateCollection(collectionId!, {
        name: data.name,
        description: data.description,
        mood: data.mood,
        isPublic: data.isPublic,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['myCollections'] });
      showToast('Collection updated!', 'success');
      setShowEditModal(false);
    },
  });

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: () => collectionService.deleteCollection(collectionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCollections'] });
      showToast('Collection deleted', 'success');
      router.back();
    },
  });

  const handleSaveToggle = () => {
    saveMutation.mutate(!isSaved);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleVinylPress = (id: string) => {
    router.push({
      pathname: '/my-vinyl-detail',
      params: { userVinylId: id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          icon="😔"
          heading="Collection not found"
          body="This collection doesn't exist or is no longer available"
        />
      </SafeAreaView>
    );
  }

  const vinyls = collection.items || [];

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
        {isOwner && (
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <MoreVertical size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Collection Info */}
        <View style={styles.collectionInfo}>
          <Text style={styles.name}>{collection.name}</Text>

          {collection.description && (
            <Text style={styles.description}>{collection.description}</Text>
          )}

          {collection.user && (
            <Text style={styles.creator}>
              by @{collection.user.username || collection.user.display_name}
            </Text>
          )}

          <View style={styles.stats}>
            <Text style={styles.statText}>
              {vinyls.length} {vinyls.length === 1 ? 'vinyl' : 'vinyls'}
            </Text>
            {collection.mood && (
              <>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.moodText}>{collection.mood}</Text>
              </>
            )}
          </View>

          {collection.save_count > 0 && (
            <Text style={styles.saveCount}>
              Saved by {collection.save_count} {collection.save_count === 1 ? 'person' : 'others'}
            </Text>
          )}

          {/* Actions */}
          {!isOwner && (
            <Button
              label={isSaved ? 'Saved' : 'Save Collection'}
              onPress={handleSaveToggle}
              variant={isSaved ? 'secondary' : 'primary'}
              icon={isSaved ? BookmarkCheck : Bookmark}
              disabled={saveMutation.isPending}
              loading={saveMutation.isPending}
              style={styles.saveButton}
            />
          )}

          {isOwner && (
            <Text style={styles.privacyNote}>
              {collection.is_public ? '🌍 Public' : '🔒 Private'}
            </Text>
          )}
        </View>

        {/* Vinyls */}
        {vinyls.length === 0 ? (
          <View style={styles.emptyState}>
            <EmptyState
              icon="🎵"
              heading="No vinyls yet"
              body={isOwner ? "Add vinyls from your library" : "Nothing in this collection yet"}
            />
          </View>
        ) : (
          <View style={styles.vinylsGrid}>
            {vinyls.map((item: any) => (
              <View key={item.id} style={styles.gridItem}>
                <VinylCard
                  id={item.user_vinyl?.id || item.id}
                  coverUrl={
                    item.user_vinyl?.vinyl?.cover_art_thumb_url ||
                    item.user_vinyl?.vinyl?.cover_art_url ||
                    ''
                  }
                  artist={item.user_vinyl?.vinyl?.artist || 'Unknown Artist'}
                  album={item.user_vinyl?.vinyl?.album || 'Unknown Album'}
                  mood={item.user_vinyl?.mood as MoodType | undefined}
                  onPress={() => handleVinylPress(item.user_vinyl?.id || item.id)}
                />
                {item.note && (
                  <Text style={styles.itemNote} numberOfLines={2}>
                    "{item.note}"
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Menu Bottom Sheet (for owners) */}
      {isOwner && (
        <BottomSheet
          isVisible={showMenu}
          onClose={() => setShowMenu(false)}
          snapPoints={['30%']}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowEditModal(true);
              }}
            >
              <Edit size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Edit Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Trash2 size={20} color={colors.states.error} />
              <Text style={[styles.menuText, styles.deleteText]}>Delete Collection</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {/* Edit Collection Modal */}
      {isOwner && (
        <CreateCollectionModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => updateMutation.mutateAsync(data)}
          initialData={{
            name: collection.name,
            description: collection.description,
            mood: collection.mood,
            isPublic: collection.is_public,
          }}
          isEditing
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  name: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  creator: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  statDivider: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  moodText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  saveCount: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  privacyNote: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  emptyState: {
    paddingTop: spacing.xxl,
  },
  vinylsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
  },
  itemNote: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  menuContent: {
    padding: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text.primary,
  },
  deleteText: {
    color: colors.states.error,
  },
});
