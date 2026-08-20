import { supabase } from './supabase';

const BUCKET = 'declaration-documents';

export interface DocumentFile {
  name: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
}

/** Lists every file stored under a declaration's own folder in the bucket. */
export async function listDocuments(declarationId: string): Promise<DocumentFile[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(declarationId, {
    sortBy: { column: 'created_at', order: 'desc' }
  });
  if (error) throw error;

  return (data ?? [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => {
      const path = `${declarationId}/${f.name}`;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        name: f.name,
        path,
        url: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? ''
      };
    });
}

export async function uploadDocument(declarationId: string, file: File): Promise<void> {
  const path = `${declarationId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
}

export async function deleteDocument(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}