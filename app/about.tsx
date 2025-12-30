import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Disc, Heart, Users, Sparkles } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Vinylia</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Disc size={48} color={colors.interactive.primary} />
          </View>
          <Text style={styles.appName}>Vinylia</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Your vinyl stories, beautifully preserved</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            Vinylia is more than a digital catalog. It's a place to preserve the stories behind every record
            in your collection—the memories of where you found them, why they matter, and the moments they
            soundtrack.
          </Text>
          <Text style={styles.paragraph}>
            Every vinyl has a story. We believe those stories deserve to be told, shared, and cherished.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Disc size={24} color={colors.interactive.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Digital Library</Text>
              <Text style={styles.featureDescription}>
                Catalog your entire collection with cover art, artist details, and metadata
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Heart size={24} color={colors.interactive.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Personal Stories</Text>
              <Text style={styles.featureDescription}>
                Share the story behind each record—the memory, the moment, the meaning
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Sparkles size={24} color={colors.interactive.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Mood-Based Organization</Text>
              <Text style={styles.featureDescription}>
                Organize records by mood and discover your collection in new ways
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Users size={24} color={colors.interactive.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Community Feed</Text>
              <Text style={styles.featureDescription}>
                Connect with fellow collectors and discover stories from around the world
              </Text>
            </View>
          </View>
        </View>

        {/* Credits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With Love</Text>
          <Text style={styles.paragraph}>
            Vinylia is crafted with passion for vinyl collectors worldwide. Built with React Native,
            Expo, and Supabase.
          </Text>
          <Text style={styles.paragraph}>
            Made for collectors, by collectors.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Vinylia</Text>
          <Text style={styles.footerText}>With love for vinyl collectors everywhere</Text>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.background.surface,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
});
