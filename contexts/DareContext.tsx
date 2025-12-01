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
  completed_at?: string;
}

interface DareContextType {
  completedDares: Record<string, { completed: boolean; imageUri?: string }>;
  streakDays: number;
  highlightedDareId: string | null;
  markDareComplete: (dare: string, imageUri?: string) => Promise<void>;
  isDareCompleted: (dare: string) => boolean;
  getDareImage: (dare: string) => string | undefined;
  deleteDare: (dare: string) => Promise<void>;
  setHighlightedDare: (dare: string) => void;
  loadDares: () => Promise<void>;
  loading: boolean;
}

const DareContext = createContext<DareContextType | undefined>(undefined);

export function DareProvider({ children }: { children: ReactNode }) {
  const [completedDares, setCompletedDares] = useState<
    Record<string, { completed: boolean; imageUri?: string }>
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
        const daresMap: Record<
          string,
          { completed: boolean; imageUri?: string }
        > = {};
        let completedCount = 0;

        data.forEach((dare: DareData) => {
          daresMap[dare.dare_text] = {
            completed: dare.completed,
            imageUri: dare.image_uri,
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

  const markDareComplete = async (dare: string, imageUri?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const wasAlreadyCompleted = completedDares[dare]?.completed || false;

      // Check if dare already exists in database
      const { data: existingDare } = await supabase
        .from("dares")
        .select("id, completed")
        .eq("user_id", user.id)
        .eq("dare_text", dare)
        .single();

      if (existingDare) {
        // Update existing dare
        const { error } = await supabase
          .from("dares")
          .update({
            completed: true,
            image_uri: imageUri,
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
          [dare]: { completed: true, imageUri },
        };
      });
    } catch (error) {
      console.error("Error marking dare complete:", error);
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

  const getDareImage = (dare: string) => {
    return completedDares[dare]?.imageUri;
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
        isDareCompleted,
        getDareImage,
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
