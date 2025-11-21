import React, { createContext, useContext, useState, ReactNode } from "react";

interface DareContextType {
  completedDares: Record<string, { completed: boolean; imageUri?: string }>;
  streakDays: number;
  highlightedDareId: string | null;
  markDareComplete: (dare: string, imageUri?: string) => void;
  isDareCompleted: (dare: string) => boolean;
  getDareImage: (dare: string) => string | undefined;
  deleteDare: (dare: string) => void;
  setHighlightedDare: (dare: string) => void;
}

const DareContext = createContext<DareContextType | undefined>(undefined);

export function DareProvider({ children }: { children: ReactNode }) {
  const [completedDares, setCompletedDares] = useState<
    Record<string, { completed: boolean; imageUri?: string }>
  >({});
  const [streakDays, setStreakDays] = useState(0); // Initial streak value
  const [highlightedDareId, setHighlightedDareId] = useState<string | null>(null);

  const markDareComplete = (dare: string, imageUri?: string) => {
    setCompletedDares((prev) => {
      // Only increment streak if this dare wasn't already completed
      const wasAlreadyCompleted = prev[dare]?.completed || false;
      if (!wasAlreadyCompleted) {
        setStreakDays((prevStreak) => prevStreak + 1);
      }
      return {
        ...prev,
        [dare]: { completed: true, imageUri },
      };
    });
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

  const deleteDare = (dare: string) => {
    setCompletedDares((prev) => {
      // Only decrement streak if this dare was completed
      const wasCompleted = prev[dare]?.completed || false;
      if (wasCompleted) {
        setStreakDays((prevStreak) => Math.max(0, prevStreak - 1));
      }
      const newDares = { ...prev };
      delete newDares[dare];
      return newDares;
    });
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

