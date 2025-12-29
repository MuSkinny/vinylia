import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { collectionService } from '@/services/collection-service';
import { CollectionCard, EmptyState, CreateCollectionModal } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing } from '@/theme';

export default function CollectionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'my' | 'saved'>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch my collections
  const { data: myCollections = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['myCollections', user?.id],
    queryFn: () => collectionService.getUserCollections(user!.id),
    enabled: !!user && activeTab === 'my',
  });

  // Fetch saved collections
  const { data: savedCollections = [], isLoading: isLoadingSaved } = useQuery({
    queryKey: ['savedCollections'],
    queryFn: () => collectionService.getSavedCollections(),
    enabled: !!user && activeTab === 'saved',
  });

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      mood?: string;
      isPublic: boolean;
    }) => collectionService.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCollections', user?.id] });
      showToast('Collection created!', 'success');
      setShowCreateModal(false);
    },
    onError: (error) => {
      console.error('Failed to create collection:', error);
      showToast('Failed to create collection', 'error');
    },
  });

  const handleCreateCollection = async (data: {
    name: string;
    description?: string;
    mood?: string;
    isPublic: boolean;
  }) => {
    await createMutation.mutateAsync(data);
  };

  const handleCollectionPress = (collectionId: string) => {
    router.push({
      pathname: '/collection-detail',
      params: { collectionId },
    });
  };

  const isLoading = activeTab === 'my' ? isLoadingMy : isLoadingSaved;
  const collections = activeTab === 'my' ? myCollections : savedCollections;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Collections</Text>
        {activeTab === 'my' && (
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={styles.addButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create new collection"
          >
            <Plus size={24} color={colors.interactive.primary} />
          </TouchableOpacity>
        )}
        {activeTab === 'saved' && <View style={styles.placeholder} />}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'my' }}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My Collections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'saved' }}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      ) : collections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'my' ? (
            <EmptyState
              icon="📑"
              heading="No collections yet"
              body="Create your first vinyl collection to organize your library by mood, meaning, or activity"
              action={{
                label: 'Create Collection',
                onPress: () => setShowCreateModal(true),
              }}
            />
          ) : (
            <EmptyState
              icon="🔖"
              heading="No saved collections"
              body="Explore and save collections from other vinyl collectors"
            />
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionCard
              collection={item}
              onPress={() => handleCollectionPress(item.id)}
              showCreator={activeTab === 'saved'}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCollection}
      />
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
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  addButton: {
    padding: spacing.sm,
  },
  placeholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  listContent: {
    padding: spacing.lg,
  },
});
