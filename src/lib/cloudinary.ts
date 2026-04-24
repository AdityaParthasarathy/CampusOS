const CLOUD_NAME = 'dm41bk9s9';
const UPLOAD_PRESET = 'ml_default';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  error?: { message: string };
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new CloudinaryUploadError('Only image files are accepted.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new CloudinaryUploadError('Image must be smaller than 5 MB.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  );

  if (!res.ok) {
    throw new CloudinaryUploadError(`Upload failed (${res.status}: ${res.statusText}).`);
  }

  const data: CloudinaryResponse = await res.json();

  if (data.error) {
    throw new CloudinaryUploadError(data.error.message);
  }

  return data.secure_url;
}
