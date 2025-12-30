import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth-service';
import { Input } from '@/components/Input';
import { Button } from '@/components';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    const changed =
      displayName !== (profile?.display_name || '') ||
      username !== (profile?.username || '') ||
      bio !== (profile?.bio || '');
    setHasChanges(changed);
  }, [displayName, username, bio, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      authService.updateProfile(user!.id, {
        display_name: displayName,
        username: username || undefined,
        bio: bio || undefined,
      }),
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile updated successfully', 'success');
      router.back();
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update profile', 'error');
    },
  });

  const handleSave = () => {
    if (!displayName.trim()) {
      showToast('Display name is required', 'error');
      return;
    }
    updateProfileMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo (Coming Soon)</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            maxLength={50}
            autoCapitalize="words"
          />

          <Input
            label="Username"
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            prefix="@"
            maxLength={30}
            autoCapitalize="none"
            helperText="Only lowercase letters, numbers, and underscores"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself and your vinyl collection"
            maxLength={200}
            multiline
            helperText="Share what makes your collection special"
          />

          <View style={styles.emailSection}>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{profile?.email}</Text>
            <Text style={styles.emailHelper}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <Button
            label={updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            disabled={!hasChanges || updateProfileMutation.isPending}
            loading={updateProfileMutation.isPending}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text.inverse,
    fontSize: 40,
  },
  changePhotoButton: {
    padding: spacing.sm,
  },
  changePhotoText: {
    ...typography.bodySmall,
    color: colors.interactive.primary,
    fontWeight: '600',
  },
  formSection: {
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    marginTop: spacing.md,
  },
  emailSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
  },
  emailLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emailValue: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emailHelper: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  buttonSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
});
