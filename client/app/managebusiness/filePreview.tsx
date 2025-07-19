import { BUSINESSIMAGESBUCKETID } from "@/lib/appwrite";
import { storage } from "@/lib/appwrite";
import { Buffer } from "buffer";

const getImages = async (business: any, isNew: boolean) => {
  const previewUrls = await Promise.all(
    business.images.map(async (imageId: string) => {
      try {
        // Get MIME type
        const metadata = await storage.getFile(BUSINESSIMAGESBUCKETID, imageId);
        const mimeType = metadata.mimeType || "image/jpeg";

        // Get preview as ArrayBuffer
        const arrayBuffer = await storage.getFilePreview(
          BUSINESSIMAGESBUCKETID,
          imageId
        );

        // Convert to base64 URI
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        if (isNew) return `data:${mimeType};base64,${base64}`;
        else return { id: imageId, uri: `data:${mimeType};base64,${base64}` };
      } catch (err) {
        console.error("Image load failed:", err);
        return null;
      }
    })
  );
  return previewUrls;
};

export default getImages;
