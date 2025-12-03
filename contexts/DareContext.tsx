import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { uploadMediaToSupabase, deleteMediaFromSupabase } from "@/lib/storage";

interface DareData {
  id: string;
  dare_text: string;
  completed: boolean;
  image_uri?: string;
  reflection_text?: string;
  draft_text?: string;
  completed_at?: string;
}

interface CompletedDareData {
  completed: boolean;
  imageUri?: string;
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
    options?: { imageUri?: string; reflectionText?: string }
  ) => Promise<void>;
  saveDraft: (dare: string, draftText: string) => Promise<void>;
  isDareCompleted: (dare: string) => boolean;
  isDareInProgress: (dare: string) => boolean;
  getDareImage: (dare: string) => string | undefined;
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

  const markDareComplete = async (
    dare: string,
    options?: { imageUri?: string; reflectionText?: string }
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const wasAlreadyCompleted = completedDares[dare]?.completed || false;
      const { imageUri, reflectionText } = options || {};
      let uploadedUrl = imageUri;

      // Upload media to Supabase Storage if it's a local file
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
          uploadedUrl = uploadResult;
        } else {
          console.error("Failed to upload media, falling back to local URI");
          uploadedUrl = imageUri; // Fallback to local URI
        }
      }

      // Check if dare already exists in database
      const { data: existingDare } = await supabase
        .from("dares")
        .select("id, completed, image_uri")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      if (existingDare) {
        // Delete old media from storage if updating with new media
        if (existingDare.image_uri && uploadedUrl !== existingDare.image_uri) {
          await deleteMediaFromSupabase(existingDare.image_uri);
        }

        // Update existing dare
        // Update existing dare - clear draft when completing
        const { error } = await supabase
          .from("dares")
          .update({
            completed: true,
            image_uri: uploadedUrl,
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
          image_uri: uploadedUrl,
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
            imageUri: uploadedUrl,
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
        saveDraft,
        isDareCompleted,
        isDareInProgress,
        getDareImage,
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
