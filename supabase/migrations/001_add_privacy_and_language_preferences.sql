-- Add privacy defaults and language preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS default_library_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS default_stories_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Create index for language queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON profiles(preferred_language);

-- Add comments for documentation
COMMENT ON COLUMN profiles.default_library_public IS
'Default visibility for new vinyls added to library';

COMMENT ON COLUMN profiles.default_stories_public IS
'Default visibility for new stories';

COMMENT ON COLUMN profiles.preferred_language IS
'User preferred UI language (en, es, it, fr)';
