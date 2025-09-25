// Storage service for file uploads (images, documents, etc.)
// Using Supabase Storage

// import { supabase } from './supabase';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export const storageService = {
  // Upload avatar/profile image
  async uploadAvatar(userId: string, file: File | Blob): Promise<UploadResult> {
    try {
      // TODO: Replace with Supabase storage
      // const fileExt = file.name.split('.').pop();
      // const fileName = `${userId}.${fileExt}`;
      // const filePath = `avatars/${fileName}`;

      // const { error: uploadError } = await supabase.storage
      //   .from('avatars')
      //   .upload(filePath, file, { upsert: true });

      // if (uploadError) {
      //   return { url: null, error: uploadError.message };
      // }

      // const { data } = supabase.storage
      //   .from('avatars')
      //   .getPublicUrl(filePath);

      // return { url: data.publicUrl, error: null };

      return { url: null, error: 'Upload não implementado ainda' };
    } catch (error) {
      return { url: null, error: 'Erro no upload' };
    }
  },

  // Upload product images
  async uploadProductImage(productId: string, file: File | Blob): Promise<UploadResult> {
    try {
      // TODO: Replace with Supabase storage
      // const fileExt = file.name.split('.').pop();
      // const fileName = `${productId}_${Date.now()}.${fileExt}`;
      // const filePath = `products/${fileName}`;

      // const { error: uploadError } = await supabase.storage
      //   .from('products')
      //   .upload(filePath, file);

      // if (uploadError) {
      //   return { url: null, error: uploadError.message };
      // }

      // const { data } = supabase.storage
      //   .from('products')
      //   .getPublicUrl(filePath);

      // return { url: data.publicUrl, error: null };

      return { url: null, error: 'Upload não implementado ainda' };
    } catch (error) {
      return { url: null, error: 'Erro no upload' };
    }
  },

  // Delete file
  async deleteFile(bucket: string, filePath: string): Promise<{ error: string | null }> {
    try {
      // TODO: Replace with Supabase storage
      // const { error } = await supabase.storage
      //   .from(bucket)
      //   .remove([filePath]);

      // return { error: error?.message || null };

      return { error: null };
    } catch (error) {
      return { error: 'Erro ao deletar arquivo' };
    }
  },

  // Get public URL for a file
  getPublicUrl(bucket: string, filePath: string): string | null {
    // TODO: Replace with Supabase storage
    // const { data } = supabase.storage
    //   .from(bucket)
    //   .getPublicUrl(filePath);

    // return data.publicUrl;

    return null;
  },
};
