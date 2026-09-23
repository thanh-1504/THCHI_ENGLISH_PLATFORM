function extractPublicId(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
  return publicIdWithExt.replace(/\.[^/.]+$/, '');
}