import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import { uploadMediaToSupabase, deleteMediaFromSupabase } from "@/lib/storage";

interface DareData {
  id: string;
  dare_text: string;
  completed: boolean;
  image_uri?: string;
  video_uri?: string;
  reflection_text?: string;
  draft_text?: string;
  completed_at?: string;
}

interface CompletedDareData {
  completed: boolean;
  imageUri?: string;
  videoUri?: string;
  reflectionText?: string;
  draftText?: string;
  completedAt?: string;
}

interface DareContextType {
  completedDares: Record<string, CompletedDareData>;
  streakDays: number;
  highlightedDareId: string | null;
  markDareComplete: (
    dare: string,
    options?: { imageUri?: string; videoUri?: string; reflectionText?: string }
  ) => Promise<void>;
  uploadVideo: (videoUri: string, dare: string) => Promise<string>;
  saveDraft: (dare: string, draftText: string) => Promise<void>;
  isDareCompleted: (dare: string) => boolean;
  isDareInProgress: (dare: string) => boolean;
  getDareImage: (dare: string) => string | undefined;
  getDareVideo: (dare: string) => string | undefined;
  getDareReflection: (dare: string) => string | undefined;
  getDareDraft: (dare: string) => string | undefined;
  getDareDate: (dare: string) => string | undefined;
  deleteDare: (dare: string) => Promise<void>;
  setHighlightedDare: (dare: string) => void;
  loadDares: () => Promise<void>;
  loading: boolean;
}

const DareContext = createContext<DareContextType | undefined>(undefined);

// Helper function to get date string in YYYY-MM-DD format (local timezone)
const getDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculate streak: consecutive days with at least one completed dare
const calculateStreak = (dares: Record<string, CompletedDareData>): number => {
  // Get all unique dates when dares were completed
  const completedDates = new Set<string>();

  Object.values(dares).forEach((dare) => {
    if (dare.completed && dare.completedAt) {
      const date = new Date(dare.completedAt);
      completedDates.add(getDateString(date));
    }
  });

  if (completedDates.size === 0) return 0;

  // Start from today and count backwards
  const today = new Date();
  let currentDate = new Date(today);
  let streak = 0;

  // Check if today has activity
  const todayStr = getDateString(today);
  const hasActivityToday = completedDates.has(todayStr);

  // If no activity today, start checking from yesterday
  if (!hasActivityToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days
  while (true) {
    const dateStr = getDateString(currentDate);
    if (completedDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export function DareProvider({ children }: { children: ReactNode }) {
  const [completedDares, setCompletedDares] = useState<
    Record<string, CompletedDareData>
  >({});
  const [streakDays, setStreakDays] = useState(0);
  const [highlightedDareId, setHighlightedDareId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Load dares from Supabase when component mounts
  const loadDares = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCompletedDares({});
        setStreakDays(0);
        return;
      }

      const { data, error } = await supabase
        .from("dares")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const daresMap: Record<string, CompletedDareData> = {};

        data.forEach((dare: DareData) => {
          daresMap[dare.dare_text] = {
            completed: dare.completed,
            imageUri: dare.image_uri,
            videoUri: dare.video_uri,
            reflectionText: dare.reflection_text,
            draftText: dare.draft_text,
            completedAt: dare.completed_at,
          };
        });

        setCompletedDares(daresMap);
        // Calculate actual streak based on consecutive days
        setStreakDays(calculateStreak(daresMap));
      }
    } catch (error) {
      console.error("Error loading dares:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDares();
  }, []);

  const uploadVideo = async (videoUri: string, dare: string): Promise<string> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
  
      // Unique filename
      const timestamp = Date.now();
      const filename = `${user.id}/${dare.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.mp4`;
  
      // Read the video file as base64
      const base64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Convert base64 to Uint8Array (binary data) - React Native compatible
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let bufferLength = base64.length * 0.75;
      if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
          bufferLength--;
        }
      }
      
      const bytes = new Uint8Array(bufferLength);
      let p = 0;
      for (let i = 0; i < base64.length; i += 4) {
        const encoded1 = chars.indexOf(base64[i]);
        const encoded2 = chars.indexOf(base64[i + 1]);
        const encoded3 = chars.indexOf(base64[i + 2]);
        const encoded4 = chars.indexOf(base64[i + 3]);
        
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        if (encoded3 !== 64) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        if (encoded4 !== 64) bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
      }
  
      // Upload using Supabase Storage REST API with proper binary data
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
      const filePath = encodeURIComponent(filename);
      const uploadUrl = `${supabaseUrl}/storage/v1/object/dare-videos/${filePath}`;
  
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'video/mp4',
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: bytes,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
  
      return `dare-videos/${filename}`;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  const markDareComplete = async (
    dare: string,
    options?: { imageUri?: string; videoUri?: string; reflectionText?: string }
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const wasAlreadyCompleted = completedDares[dare]?.completed || false;
      let imageUri = options?.imageUri;
      let videoUri = options?.videoUri;
      let reflectionText = options?.reflectionText;

      // Upload image to Supabase Storage if it's a local file
      if (imageUri && !imageUri.includes("supabase.co")) {
        const dareId = `dare_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const uploadResult = await uploadMediaToSupabase(
          imageUri,
          user.id,
          dareId
        );

        if (uploadResult) {
          imageUri = uploadResult;
        } else {
          console.error("Failed to upload image, falling back to local URI");
        }
      }

      // If videoUri is a local file, upload it to Supabase Storage using our custom function
      if (videoUri && (videoUri.startsWith("file://") || videoUri.startsWith("content://"))) {
        try {
          const uploadedUrl = await uploadVideo(videoUri, dare);
          videoUri = uploadedUrl;
        } catch (error) {
          console.error("Error uploading video:", error);
          throw error;
        }
      }

      // Check if dare already exists in database
      const { data: existingDare } = await supabase
        .from("dares")
        .select("id, completed, image_uri, video_uri")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      if (existingDare) {
        // Delete old media from storage if updating with new media
        if (existingDare.image_uri && imageUri !== existingDare.image_uri) {
          await deleteMediaFromSupabase(existingDare.image_uri);
        }
        if (existingDare.video_uri && videoUri !== existingDare.video_uri) {
          // Note: Video deletion would need to be implemented if needed
        }

        // Update existing dare - clear draft when completing
        const { error } = await supabase
          .from("dares")
          .update({
            completed: true,
            image_uri: imageUri,
            video_uri: videoUri,
            reflection_text: reflectionText,
            draft_text: null, // Clear draft on completion
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDare.id);

        if (error) throw error;
      } else {
        // Insert new dare
        const { error } = await supabase.from("dares").insert({
          user_id: user.id,
          dare_text: dare,
          completed: true,
          image_uri: imageUri,
          video_uri: videoUri,
          reflection_text: reflectionText,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      // Update local state and recalculate streak
      setCompletedDares((prev) => {
        const newDares = {
          ...prev,
          [dare]: {
            completed: true,
            imageUri,
            videoUri,
            reflectionText,
            draftText: undefined, // Clear draft on completion
            completedAt: new Date().toISOString(),
          },
        };
        // Recalculate streak based on consecutive days
        setStreakDays(calculateStreak(newDares));
        return newDares;
      });
    } catch (error) {
      console.error("Error marking dare complete:", error);
    }
  };

  const saveDraft = async (dare: string, draftText: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if dare already exists in database
      const { data: existingDare } = await supabase
        .from("dares")
        .select("id")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      if (existingDare) {
        // Update existing dare with draft
        const { error } = await supabase
          .from("dares")
          .update({
            draft_text: draftText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDare.id);

        if (error) throw error;
      } else {
        // Insert new dare with draft (not completed)
        const { error } = await supabase.from("dares").insert({
          user_id: user.id,
          dare_text: dare,
          completed: false,
          draft_text: draftText,
        });

        if (error) throw error;
      }

      // Update local state
      setCompletedDares((prev) => ({
        ...prev,
        [dare]: {
          ...prev[dare],
          completed: prev[dare]?.completed || false,
          draftText,
        },
      }));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const setHighlightedDare = (dare: string) => {
    setHighlightedDareId(dare);
    setTimeout(() => {
      setHighlightedDareId(null);
    }, 1500);
  };

  const isDareCompleted = (dare: string) => {
    return completedDares[dare]?.completed || false;
  };

  const isDareInProgress = (dare: string) => {
    const dareData = completedDares[dare];
    return !dareData?.completed && !!dareData?.draftText;
  };

  const getDareImage = (dare: string) => {
    return completedDares[dare]?.imageUri;
  };

  const getDareVideo = (dare: string) => {
    return completedDares[dare]?.videoUri;
  };

  const getDareReflection = (dare: string) => {
    return completedDares[dare]?.reflectionText;
  };

  const getDareDraft = (dare: string) => {
    return completedDares[dare]?.draftText;
  };

  const getDareDate = (dare: string) => {
    return completedDares[dare]?.completedAt;
  };

  const deleteDare = async (dare: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get the dare to find its media URL
      const { data: dareData } = await supabase
        .from("dares")
        .select("image_uri")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      // Delete media from storage if exists
      if (dareData?.image_uri) {
        await deleteMediaFromSupabase(dareData.image_uri);
      }

      // Delete from database
      const { error } = await supabase
        .from("dares")
        .delete()
        .eq("user_id", user.id)
        .eq("dare_text", dare);

      if (error) throw error;

      // Update local state and recalculate streak
      setCompletedDares((prev) => {
        const newDares = { ...prev };
        delete newDares[dare];
        // Recalculate streak based on consecutive days
        setStreakDays(calculateStreak(newDares));
        return newDares;
      });
    } catch (error) {
      console.error("Error deleting dare:", error);
    }
  };

  return (
    <DareContext.Provider
      value={{
        completedDares,
        streakDays,
        highlightedDareId,
        markDareComplete,
        uploadVideo,
        saveDraft,
        isDareCompleted,
        isDareInProgress,
        getDareImage,
        getDareVideo,
        getDareReflection,
        getDareDraft,
        getDareDate,
        deleteDare,
        setHighlightedDare,
        loadDares,
        loading,
      }}
    >
      {children}
    </DareContext.Provider>
  );
}

export function useDare() {
  const context = useContext(DareContext);
  if (!context) {
    throw new Error("useDare must be used within a DareProvider");
  }
  return context;
}
