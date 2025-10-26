/**
 * Utility for uploading files to Vercel Blob Storage
 */

export async function uploadToVercelBlob(
  blob: Blob,
  filename: string
): Promise<string> {
  try {
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('filename', filename);

    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url as string;
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw error;
  }
}

/**
 * Upload from canvas data (data URL)
 */
export async function uploadCanvasToVercelBlob(
  dataUrl: string,
  filename: string
): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return uploadToVercelBlob(blob, filename);
}

/**
 * Upload video blob
 */
export async function uploadVideoToVercelBlob(
  blob: Blob,
  filename: string
): Promise<string> {
  return uploadToVercelBlob(blob, filename);
}

/**
 * Upload File object (from file input)
 */
export async function uploadFileToVercelBlob(
  file: File,
  filename?: string
): Promise<string> {
  return uploadToVercelBlob(file, filename || file.name);
}
