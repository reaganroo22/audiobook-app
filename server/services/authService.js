const supabase = require('../config/supabase');

class AuthService {
  constructor() {
    console.log('✅ AuthService initialized with Supabase');
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        throw error;
      }

      return data.user;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  }

  // Store user's audiobook
  async saveUserAudiobook(userId, audiobookData) {
    try {
      const { data, error } = await supabase
        .from('user_audiobooks')
        .insert({
          user_id: userId,
          filename: audiobookData.filename,
          title: audiobookData.title || 'Untitled Audiobook',
          audio_url: audiobookData.audioUrl,
          pages_count: audiobookData.totalPages || 0,
          summaries_count: audiobookData.summariesGenerated || 0,
          duration: audiobookData.duration || 0,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Save audiobook failed:', error);
      throw error;
    }
  }

  // Get user's audiobooks
  async getUserAudiobooks(userId) {
    try {
      const { data, error } = await supabase
        .from('user_audiobooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get user audiobooks failed:', error);
      throw error;
    }
  }
}

module.exports = AuthService;