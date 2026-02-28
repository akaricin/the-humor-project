export async function generatePresignedUrl(fileType: string, supabaseToken: string): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const response = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType: fileType }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate presigned URL: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    presignedUrl: data.presignedUrl,
    cdnUrl: data.cdnUrl,
  };
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<boolean> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 Upload failed: ${response.statusText}`);
  }

  return true;
}

export async function registerImage(cdnUrl: string, supabaseToken: string): Promise<{ imageId: string }> {
  const response = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageUrl: cdnUrl,
      isCommonUse: false
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to register image: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    imageId: data.imageId,
  };
}

export interface CaptionResult {
  id: string;
  content: string;
}

export async function generateCaptions(imageId: string, supabaseToken: string): Promise<{ captions: CaptionResult[] }> {
  const response = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageId: imageId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate captions: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}