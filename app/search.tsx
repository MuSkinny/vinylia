import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { vinylService } from '@/services/vinyl-service';
import { SearchBar, EmptyState } from '@/components';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useToast } from '@/hooks';
import type { DiscogsSearchResult } from '@/types/database';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DiscogsSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await vinylService.searchVinyls(query, 20);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      showToast('Search failed. Try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVinyl = (release: DiscogsSearchResult) => {
    const { artist, album } = vinylService.parseDiscogsTitle(release.title);
    const coverUrl = release.thumb || release.cover_image || '';
    const year = release.year?.toString() || '';
    const label = release.label?.[0] || '';

    router.push({
      pathname: '/add-vinyl',
      params: {
        releaseId: release.id.toString(),
        coverUrl,
        artist,
        album,
        year,
        label,
      },
    });
  };

  const renderItem = ({ item }: { item: DiscogsSearchResult }) => {
    const { artist, album } = vinylService.parseDiscogsTitle(item.title);
    const coverUrl = item.thumb || item.cover_image;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectVinyl(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${artist}, ${album}`}
      >
        <View style={styles.coverContainer}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>♫</Text>
            </View>
          )}
        </View>

        <View style={styles.resultInfo}>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
          <Text style={styles.album} numberOfLines={1}>
            {album}
          </Text>
          <View style={styles.metadata}>
            {item.year && <Text style={styles.metadataText}>{item.year}</Text>}
            {item.format?.[0] && (
              <Text style={styles.metadataText}>{item.format[0]}</Text>
            )}
            {item.label?.[0] && (
              <Text style={styles.metadataText} numberOfLines={1}>
                {item.label[0]}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity
          onPress={() => router.push('/barcode-scanner')}
          style={styles.iconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Scan barcode"
        >
          <Camera size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by artist, album..."
          autoFocus
        />
        {query.length > 0 && query.length < 2 && (
          <Text style={styles.hint}>Type at least 2 characters to search</Text>
        )}
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
          <Text style={styles.loadingText}>Searching Discogs...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : query.length >= 2 ? (
        <EmptyState
          icon="🔍"
          heading="No results found"
          body="Try a different search term or use the barcode scanner."
        />
      ) : (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsIcon}>🎵</Text>
          <Text style={styles.instructionsHeading}>Search Discogs</Text>
          <Text style={styles.instructionsBody}>
            World's largest vinyl database{'\n'}
            with millions of records
          </Text>

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Try searching:</Text>
            <View style={styles.examplesList}>
              <Text style={styles.exampleText}>• Pink Floyd Dark Side</Text>
              <Text style={styles.exampleText}>• Miles Davis Kind of Blue</Text>
              <Text style={styles.exampleText}>• Radiohead OK Computer</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/barcode-scanner')}
          >
            <Camera size={20} color={colors.interactive.primary} />
            <Text style={styles.scanButtonText}>Or scan a barcode</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.muted,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  coverContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  cover: {
    width: 60,
    height: 60,
    backgroundColor: colors.background.elevated,
  },
  coverPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 24,
    color: colors.text.muted,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artist: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  album: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  instructionsIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  instructionsHeading: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  instructionsBody: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  examples: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  examplesTitle: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  examplesList: {
    alignItems: 'flex-start',
  },
  exampleText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.divider.light,
    marginBottom: spacing.xl,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  scanButtonText: {
    ...typography.body,
    color: colors.interactive.primary,
    fontWeight: '600',
  },
});
