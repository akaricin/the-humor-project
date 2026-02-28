
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
