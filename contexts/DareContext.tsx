import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

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
        let completedCount = 0;

        data.forEach((dare: DareData) => {
          daresMap[dare.dare_text] = {
            completed: dare.completed,
            imageUri: dare.image_uri,
            videoUri: dare.video_uri,
            reflectionText: dare.reflection_text,
            draftText: dare.draft_text,
            completedAt: dare.completed_at,
          };
          if (dare.completed) completedCount++;
        });

        setCompletedDares(daresMap);
        setStreakDays(completedCount);
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

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `${user.id}/${dare.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.mp4`;

      // Read the video file
      const response = await fetch(videoUri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("dare-videos")
        .upload(filename, blob, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (error) throw error;

      // Return the path (we'll use signed URLs when displaying)
      // Format: {bucket}/{path}
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
      let { imageUri, videoUri, reflectionText } = options || {};

      // If videoUri is a local file, upload it to Supabase Storage
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
        .select("id, completed")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      if (existingDare) {
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

      // Update local state
      setCompletedDares((prev) => {
        if (!wasAlreadyCompleted) {
          setStreakDays((prevStreak) => prevStreak + 1);
        }
        return {
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

      // Delete from database
      const { error } = await supabase
        .from("dares")
        .delete()
        .eq("user_id", user.id)
        .eq("dare_text", dare);

      if (error) throw error;

      // Update local state
      setCompletedDares((prev) => {
        const wasCompleted = prev[dare]?.completed || false;
        if (wasCompleted) {
          setStreakDays((prevStreak) => Math.max(0, prevStreak - 1));
        }
        const newDares = { ...prev };
        delete newDares[dare];
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
