import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

/**
 * Upload an image or video to Supabase Storage
 * @param uri - Local file URI from image/video picker
 * @param userId - User ID for organizing files
 * @param dareId - Unique identifier for this dare
 * @returns Public URL of uploaded file or null if failed
 */
export async function uploadMediaToSupabase(
  uri: string,
  userId: string,
  dareId: string
): Promise<string | null> {
  try {
    // Determine file extension and type
    const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
    const isVideo = ["mp4", "mov", "avi", "webm", "mkv"].includes(fileExt);
    const fileName = `${userId}/${dareId}.${fileExt}`;
    const bucket = isVideo ? "dare-videos" : "dare-images";

    console.log(
      `Uploading ${isVideo ? "video" : "image"} to ${bucket}/${fileName}`
    );

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to array buffer for Supabase
    const arrayBuffer = decode(base64);

    // Determine content type
    const contentType = isVideo
      ? `video/${fileExt}`
      : `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: true, // Overwrite if file already exists
      });

    if (error) {
      console.error("Error uploading to Supabase Storage:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    console.log("Upload successful:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadMediaToSupabase:", error);
    return null;
  }
}

/**
 * Delete media from Supabase Storage
 * @param url - Public URL of the file to delete
 * @returns true if successful
 */
export async function deleteMediaFromSupabase(url: string): Promise<boolean> {
  try {
    if (!url || !url.includes("supabase.co")) {
      return false; // Not a Supabase URL, skip deletion
    }

    // Extract bucket and file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const urlParts = url.split("/storage/v1/object/public/");
    if (urlParts.length < 2) return false;

    const [bucket, ...pathParts] = urlParts[1].split("/");
    const filePath = pathParts.join("/");

    console.log(`Deleting from ${bucket}/${filePath}`);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting from Supabase Storage:", error);
      return false;
    }

    console.log("Delete successful");
    return true;
  } catch (error) {
    console.error("Error in deleteMediaFromSupabase:", error);
    return false;
  }
}

/**
 * Check if a URI is a Supabase Storage URL or a local file path
 */
export function isSupabaseUrl(uri: string): boolean {
  return uri?.includes("supabase.co/storage") || false;
}

/**
 * Check if a URI points to a video file
 */
export function isVideoFile(uri: string): boolean {
  if (!uri) return false;
  const ext = uri.split(".").pop()?.toLowerCase() || "";
  return ["mp4", "mov", "avi", "webm", "mkv"].includes(ext);
}
