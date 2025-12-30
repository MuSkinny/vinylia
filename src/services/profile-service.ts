import { supabase } from './supabase';

interface PrivacySettings {
  default_library_public?: boolean;
  default_stories_public?: boolean;
}

interface LanguagePreference {
  preferred_language?: string;
}

export const profileService = {
  // Update privacy settings
  async updatePrivacySettings(userId: string, settings: PrivacySettings) {
    const { data, error } = await supabase
      .from('profiles')
      .update(settings)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update language preference
  async updateLanguagePreference(userId: string, language: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ preferred_language: language })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user privacy settings
  async getPrivacySettings(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('default_library_public, default_stories_public, preferred_language')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },
};
