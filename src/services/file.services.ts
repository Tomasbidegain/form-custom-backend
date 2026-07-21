import cloudinary from "../config/cloudinary";
import { ERRORS } from "../utils/errors";

export class FileService {
  async uploadFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "form-custom-uploads",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(new Error(ERRORS.FILE_UPLOAD_FAILED.code));
          } else {
            resolve(result!.secure_url);
          }
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(url: string): Promise<void> {
    // Extraer public_id de la URL
    const publicId = this.extractPublicId(url);
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  }
}