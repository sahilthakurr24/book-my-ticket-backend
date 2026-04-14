import ApiError from "../utils/api-error.js";
import { client } from "../config/imagekit.js";
import fs from "node:fs";

export async function uploadImageToImageKit(file, folder) {
  if (!file) {
    return null;
  }

  let filePayload;
  const filePath = file.path;

  if (file.buffer) {
    filePayload = file.buffer;
  } else if (filePath) {
    filePayload = fs.createReadStream(filePath);
  }

  if (!filePayload || !file.originalname) {
    throw ApiError.badRequest("Invalid file upload payload");
  }

  try {
    const uploadResponse = await client.files.upload({
      file: filePayload,
      fileName: file.originalname,
      folder,
    });

    return {
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl,
    };
  } finally {
    if (filePath) {
      fs.promises.unlink(filePath).catch(() => {});
    }
  }
}

export async function deleteImageFromImageKit(fileId) {
  if (!fileId) {
    return;
  }

  await client.files.delete(fileId);
}
