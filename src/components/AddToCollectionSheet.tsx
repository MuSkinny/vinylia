import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CheckSquare, Square, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '@/services/collection-service';
import { useAuth } from '@/contexts/AuthContext';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface AddToCollectionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  userVinylId: string;
  onCreateCollection?: () => void;
}

export function AddToCollectionSheet({
  isVisible,
  onClose,
  userVinylId,
  onCreateCollection,
}: AddToCollectionSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  // Fetch user's collections
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['myCollections', user?.id],
    queryFn: () => collectionService.getUserCollections(user!.id),
    enabled: !!user && isVisible,
  });

  // Check which collections already contain this vinyl
  useEffect(() => {
    if (isVisible && collections.length > 0) {
      const collectionsWithVinyl = new Set<string>();
      collections.forEach((collection: any) => {
        // Check if this collection contains the vinyl
        // We'll need to fetch each collection's items
        // For now, we'll handle this differently
      });
      setSelectedCollections(collectionsWithVinyl);
    }
  }, [isVisible, collections, userVinylId]);

  // Add vinyl to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: ({ collectionId, note }: { collectionId: string; note?: string }) =>
      collectionService.addVinylToCollection(collectionId, userVinylId, note),
  });

  // Remove vinyl from collection mutation
  const removeFromCollectionMutation = useMutation({
    mutationFn: (collectionItemId: string) =>
      collectionService.removeVinylFromCollection(collectionItemId),
  });

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
        // Show note input when adding to a collection
        setShowNoteFor(collectionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      // Add to selected collections
      const addPromises = Array.from(selectedCollections).map((collectionId) =>
        addToCollectionMutation.mutateAsync({
          collectionId,
          note: notes[collectionId],
        })
      );

      await Promise.all(addPromises);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['myCollections'] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });

      onClose();
    } catch (error) {
      console.error('Failed to update collections:', error);
    }
  };

  const renderCollection = ({ item }: { item: any }) => {
    const isSelected = selectedCollections.has(item.id);
    const showNote = showNoteFor === item.id;

    return (
      <View style={styles.collectionItem}>
        <TouchableOpacity
          style={styles.collectionRow}
          onPress={() => handleToggleCollection(item.id)}
        >
          {isSelected ? (
            <CheckSquare size={24} color={colors.interactive.primary} />
          ) : (
            <Square size={24} color={colors.text.muted} />
          )}
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionCount}>
              {item.collection_items?.[0]?.count || 0} vinyls
            </Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.noteSection}>
            <TextInput
              style={styles.noteInput}
              value={notes[item.id] || ''}
              onChangeText={(text) =>
                setNotes((prev) => ({ ...prev, [item.id]: text }))
              }
              placeholder="Why does this belong here? (optional)"
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={200}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <BottomSheet visible={isVisible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add to Collection</Text>
          <TouchableOpacity onPress={onCreateCollection} style={styles.createButton}>
            <Plus size={20} color={colors.interactive.primary} />
            <Text style={styles.createText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Collections List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.interactive.primary} />
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📑</Text>
            <Text style={styles.emptyText}>No collections yet</Text>
            <Text style={styles.emptySubtext}>Create your first collection</Text>
            <Button
              label="Create Collection"
              onPress={onCreateCollection}
              variant="primary"
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={collections}
              keyExtractor={(item) => item.id}
              renderItem={renderCollection}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Button
                label="Cancel"
                onPress={onClose}
                variant="secondary"
                style={styles.cancelButton}
              />
              <Button
                label={`Add to ${selectedCollections.size} ${
                  selectedCollections.size === 1 ? 'Collection' : 'Collections'
                }`}
                onPress={handleSave}
                variant="primary"
                disabled={selectedCollections.size === 0}
                loading={addToCollectionMutation.isPending}
                style={styles.saveButton}
              />
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  createText: {
    ...typography.bodySmall,
    color: colors.interactive.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
  },
  collectionItem: {
    marginBottom: spacing.md,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  collectionCount: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  noteSection: {
    marginTop: spacing.sm,
    marginLeft: 40,
  },
  noteInput: {
    ...typography.bodySmall,
    color: colors.text.primary,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.divider.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider.light,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
