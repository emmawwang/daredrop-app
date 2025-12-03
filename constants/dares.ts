import { ImageSourcePropType } from "react-native";

// Dare types
export type DareType = "photo" | "text" | "video" | "drawing";

export interface Dare {
  id: string;
  text: string;
  type: DareType;
  placeholder?: string; // For text dares, the placeholder text in the input
}

// Icon mapping for text dares (React Native requires static requires)
export const textDareIcons: Record<string, ImageSourcePropType> = {
  "Compliment a stranger and reflect on it": require("@/assets/dare-compliment..jpg"),
  "Write a letter to your future self 5 years from now": require("@/assets/dare-letter.png.jpg"),
  "Create a playlist of 5 songs that tell a story": require("@/assets/dare-playlist.jpg"),
  "Write a 50-word story that ends with the word 'finally'": require("@/assets/dare-story.jpg"),
  "Compose a haiku to James Landay": require("@/assets/dare-haiku.png.jpg"),
  "Write a goal for your future self in 5 years": require("@/assets/dare-goal.jpg"),
  "What advice would you give to a future CS147 student?": require("@/assets/dare-advice.jpg"),
};

// Icon mapping for video dares (React Native requires static requires)
export const videoDareIcons: Record<string, ImageSourcePropType> = {
  "Tell yourself a joke and record your reaction": require("@/assets/dare-joke.jpeg"),
};

// Sample dares - these will later be fetched from an API or database
export const sampleDares: Dare[] = [
  {
    id: "1",
    text: "Take a photo of something beautiful!",
    type: "photo",
  },
  {
    id: "2",
    text: "Compliment a stranger and reflect on it",
    type: "text",
    placeholder: "How did it feel? What did you say? How did they react?",
  },
  {
    id: "3",
    text: "Draw DareDrop a new logo!",
    type: "drawing",
  },
  {
    id: "4",
    text: "Write a goal for your future self in 5 years",
    type: "text",
    placeholder: "What do you want to tell your future self?",
  },
  {
    id: "5",
    text: "Draw a self-portrait using one line",
    type: "drawing",
  },
  {
    id: "6",
    text: "What advice would you give to a future CS147 student?",
    type: "text",
    placeholder: "Share your advice and what you've learned...",
  },
  {
    id: "7",
    text: "Take a selfie with your CA!",
    type: "photo",
  },
  {
    id: "8",
    text: "Write a 50-word story that ends with the word 'finally'",
    type: "text",
    placeholder: "Once upon a time...",
  },
  {
    id: "9",
    text: "Tell James a funny joke! [adi change this to video?]",
    type: "photo",
  },
  {
    id: "10",
    text: "Compose a haiku to James Landay",
    type: "text",
    placeholder: "5 syllables, 7 syllables, 5 syllables...",
  },
  {
    id: "11",
    text: "Tell yourself a joke and record your reaction",
    type: "video",
  }
];

/**
 * Get a random dare from the list, optionally excluding specific dares
 * @param excludeDareTexts - Single dare text or array of dare texts to exclude
 */
export function getRandomDare(excludeDareTexts?: string | string[]): Dare {
  const excludeList = excludeDareTexts
    ? Array.isArray(excludeDareTexts)
      ? excludeDareTexts
      : [excludeDareTexts]
    : [];

  const availableDares = sampleDares.filter(
    (d) => !excludeList.includes(d.text)
  );

  if (availableDares.length === 0) {
    // Fallback if all dares are excluded - return random from all
    return sampleDares[Math.floor(Math.random() * sampleDares.length)];
  }

  return availableDares[Math.floor(Math.random() * availableDares.length)];
}

/**
 * Get dare info by text
 */
export function getDareByText(dareText: string): Dare | undefined {
  return sampleDares.find((d) => d.text === dareText);
}

/**
 * Get icon for a text dare
 */
export function getTextDareIcon(
  dareText: string
): ImageSourcePropType | undefined {
  return textDareIcons[dareText];
}

/**
 * Get icon for a video dare
 */
export function getVideoDareIcon(
  dareText: string
): ImageSourcePropType | undefined {
  return videoDareIcons[dareText];
}
