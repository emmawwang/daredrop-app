import React, { createContext, useContext, useState, ReactNode } from "react";

interface DareContextType {
  completedDares: Record<string, { completed: boolean; imageUri?: string }>;
  markDareComplete: (dare: string, imageUri?: string) => void;
  isDareCompleted: (dare: string) => boolean;
  getDareImage: (dare: string) => string | undefined;
  deleteDare: (dare: string) => void;
}

const DareContext = createContext<DareContextType | undefined>(undefined);

export function DareProvider({ children }: { children: ReactNode }) {
  const [completedDares, setCompletedDares] = useState<
    Record<string, { completed: boolean; imageUri?: string }>
  >({});

  const markDareComplete = (dare: string, imageUri?: string) => {
    setCompletedDares((prev) => ({
      ...prev,
      [dare]: { completed: true, imageUri },
    }));
  };

  const isDareCompleted = (dare: string) => {
    return completedDares[dare]?.completed || false;
  };

  const getDareImage = (dare: string) => {
    return completedDares[dare]?.imageUri;
  };

  const deleteDare = (dare: string) => {
    setCompletedDares((prev) => {
      const newDares = { ...prev };
      delete newDares[dare];
      return newDares;
    });
  };

  return (
    <DareContext.Provider
      value={{
        completedDares,
        markDareComplete,
        isDareCompleted,
        getDareImage,
        deleteDare,
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

