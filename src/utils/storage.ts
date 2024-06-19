import { Storage } from "@google-cloud/storage";
import multer from "multer";

export const IMAGE_MIME_TYPES = ['image/gif', 'image/jpeg', 'image/png'];

// using ADC for auth
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 10mb
  },
});

export async function uploadFile(fileName: string, fileMimeType: string, fileBuffer: Buffer): Promise<string> {
  const destFilename = 'test';

  const options = {
    destination: destFilename,
    // Optional:
    // Set a generation-match precondition to avoid potential race conditions
    // and data corruptions. The request to upload is aborted if the object's
    // generation number does not match your precondition. For a destination
    // object that does not yet exist, set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    preconditionOpts: {
      ifGenerationMatch: 0
    },
  };

  const blob = bucket.file(fileName, options);
  blob.metadata.contentType = fileMimeType;
  const blobStream = blob.createWriteStream();

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    });

    blobStream.end(fileBuffer);
  });
}
