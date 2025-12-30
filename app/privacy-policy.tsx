import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '@/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

          <Text style={styles.intro}>
            At Vinylia, we respect your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, including:
          </Text>
          <Text style={styles.bulletPoint}>• Account information (email, username, display name)</Text>
          <Text style={styles.bulletPoint}>• Profile information (bio, avatar)</Text>
          <Text style={styles.bulletPoint}>• Vinyl collection data (records, stories, moods)</Text>
          <Text style={styles.bulletPoint}>• Collection organization (collections, notes)</Text>
          <Text style={styles.bulletPoint}>• Privacy preferences and settings</Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain your vinyl library</Text>
          <Text style={styles.bulletPoint}>• Enable you to share stories and connect with other collectors</Text>
          <Text style={styles.bulletPoint}>• Improve and personalize your experience</Text>
          <Text style={styles.bulletPoint}>• Send you important updates about the service</Text>
          <Text style={styles.bulletPoint}>• Protect against fraud and abuse</Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information only:
          </Text>
          <Text style={styles.bulletPoint}>
            • Publicly, if you choose to make your library or stories public
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Your Privacy Controls</Text>
          <Text style={styles.paragraph}>
            You have control over your privacy:
          </Text>
          <Text style={styles.bulletPoint}>
            • Choose whether your library is public or private
          </Text>
          <Text style={styles.bulletPoint}>
            • Control whether individual records appear in your public profile
          </Text>
          <Text style={styles.bulletPoint}>
            • Decide if your stories appear in the community feed
          </Text>
          <Text style={styles.bulletPoint}>
            • Edit or delete your content at any time
          </Text>
          <Text style={styles.bulletPoint}>
            • Delete your account and all associated data
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your information against unauthorized
            access, alteration, disclosure, or destruction. We use secure encryption for data transmission
            and storage.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as your account is active or as needed to provide you
            services. You can request deletion of your account and data at any time.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have rights including:
          </Text>
          <Text style={styles.bulletPoint}>• Access to your personal information</Text>
          <Text style={styles.bulletPoint}>• Correction of inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Objection to certain data processing</Text>
          <Text style={styles.bulletPoint}>• Data portability</Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Vinylia is not intended for children under 13. We do not knowingly collect information from
            children under 13. If you believe we have collected such information, please contact us.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any significant
            changes by posting the new policy and updating the "Last updated" date.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or your personal information, please contact
            us at privacy@vinylia.app.
          </Text>
        </View>

        <View style={styles.footer} />
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
  section: {
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    marginTop: spacing.xs,
  },
  lastUpdated: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  intro: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontSize: 18,
  },
  paragraph: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  footer: {
    height: spacing.xxxl,
  },
});
