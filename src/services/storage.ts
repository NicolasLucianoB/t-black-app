// Storage service for file uploads (images, documents, etc.)
// Using Supabase Storage

import { supabase } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export const storageService = {
  // Upload avatar/profile image - React Native optimized
  async uploadAvatar(userId: string, imageUri: string, fileName?: string): Promise<UploadResult> {
    try {
      // Generate file extension and path with user folder
      const fileExt = fileName ? fileName.split('.').pop() : 'jpg';
      const finalFileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${finalFileName}`;

      // Use FormData for React Native
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: finalFileName,
      } as any);

      // Get Supabase URL and headers
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { url: null, error: 'Usuário não autenticado' };
      }

      // Upload using fetch directly (works better in React Native)
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${filePath}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        return { url: null, error: 'Falha no upload da imagem' };
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Storage error:', error);
      return { url: null, error: 'Erro no upload' };
    }
  },

  // Delete file (useful for cleaning up old avatars)
  async deleteFile(bucket: string, filePath: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      return { error: error?.message || null };
    } catch (error) {
      console.error('Delete error:', error);
      return { error: 'Erro ao deletar arquivo' };
    }
  },

  // Get public URL for a file (useful for displaying images)
  getPublicUrl(bucket: string, filePath: string): string | null {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Get URL error:', error);
      return null;
    }
  },
};
