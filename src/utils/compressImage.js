import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file client-side before upload.
 *
 * Vercel serverless functions (Server808) have a hard 4.5MB request body
 * limit that cannot be raised via config -- large phone photos routinely
 * exceed it and get rejected with a 413 before the request ever reaches
 * the app, regardless of any server-side upload/quota handling. Shrinking
 * the file in the browser first is the only real fix.
 *
 * Non-image files pass through untouched. If compression itself fails for
 * any reason (e.g. a format the browser can't decode, like some HEIC
 * photos outside Safari), the original file is returned rather than
 * blocking the upload -- it may still hit the size limit, but that's the
 * same behavior as before this existed, not worse.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImage(file) {
  if (!file || !file.type?.startsWith('image/')) return file;

  try {
    return await imageCompression(file, {
      maxSizeMB: 3,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      initialQuality: 0.85,
    });
  } catch (error) {
    console.error('Image compression failed, uploading original file:', error);
    return file;
  }
}
