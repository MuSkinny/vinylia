import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      showToast('Account created! Check your email.', 'success');
      router.replace('/(auth)/login');
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>🎵</Text>
            <Text style={styles.title}>Join Vinylia</Text>
            <Text style={styles.subtitle}>Create your vinyl story</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Display Name (optional)"
              placeholderTextColor={colors.text.muted}
              value={displayName}
              onChangeText={setDisplayName}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor={colors.text.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.linkButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back to login"
            >
              <Text style={styles.linkText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.divider.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.interactive.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.inverse,
    ...typography.body,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.sm,
  },
  linkText: {
    color: colors.interactive.primary,
    ...typography.bodySmall,
    fontWeight: '500',
  },
});
