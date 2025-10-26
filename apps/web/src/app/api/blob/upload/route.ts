import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'file is required' },
        { status: 400 }
      );
    }

    const fileName = form.get('filename') as string || (file as File).name;
    const mimeType = (file as File).type || 'application/octet-stream';
    
    // Upload to Vercel Blob
    const blob = await put(fileName, file as File, {
      access: 'public',
      contentType: mimeType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: (file as File).name,
      },
    }  as any);

    return NextResponse.json({
      url: blob.url,
      fileName: fileName,
      size: (file as File).size,
      type: mimeType,
    });
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
