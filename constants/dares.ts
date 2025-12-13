import { ImageSourcePropType } from "react-native";

// Dare types
export type DareType = "photo" | "text" | "video" | "drawing" | "spotify";

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
  "Compose a haiku to a long-distance friend": require("@/assets/dare-haiku.png.jpg"),
  "Write a goal for your future self in 5 years": require("@/assets/dare-goal.jpg"),
  "What advice would you give to your future self?": require("@/assets/dare-advice.jpg"),
  "Write a poem about a random person you saw today": require("@/assets/dare-haiku.png.jpg"),
  "Write a 6-word story": require("@/assets/dare-story.jpg"),
  "List 3 things you're grateful for today": require("@/assets/dare-compliment..jpg"),
  "Create a new word and define it": require("@/assets/dare-joke.jpeg"),
  "Describe your perfect day in 3 sentences": require("@/assets/dare-goal.jpg"),
  "Write a message to your past self from one year ago": require("@/assets/dare-letter.png.jpg"),
};

// Icon mapping for video dares (React Native requires static requires)
export const videoDareIcons: Record<string, ImageSourcePropType> = {
  "Record yourself telling someone a joke!": require("@/assets/dare-joke.jpeg"),
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
    text: "What advice would you give to your future self?",
    type: "text",
    placeholder: "Share your advice and what you've learned...",
  },
  {
    id: "7",
    text: "Write a 50-word story that ends with the word 'finally'",
    type: "text",
    placeholder: "Once upon a time...",
  },
  {
    id: "8",
    text: "Record yourself telling someone a joke!",
    type: "video",
  },
  {
    id: "9",
    text: "Compose a haiku to a long-distance friend",
    type: "text",
    placeholder: "5 syllables, 7 syllables, 5 syllables...",
  },
  {
    id: "10",
    text: "Create a playlist of 5 songs that tell a story",
    type: "text",
    placeholder: "What's the story? What are the songs?",
  },
  {
    id: "11",
    text: "Find an old photo of people you love",
    type: "photo",
  },
  {
    id: "12",
    text: "Find a song that reminds you of yourself five years ago",
    type: "spotify",
  },
  {
    id: "13",
    text: "Find a song that describes your current mood",
    type: "spotify",
  },
  {
    id: "14",
    text: "Find a song that makes you feel nostalgic",
    type: "spotify",
  },
  {
    id: "15",
    text: "Find a song that represents your biggest dream",
    type: "spotify",
  },
  {
    id: "16",
    text: "Find a song that reminds you of someone special",
    type: "spotify",
  },
  {
    id: "17",
    text: "Write a poem about a random person you saw today",
    type: "text",
    placeholder:
      "What did they look like? What did they do? What did you think?",
  },
  {
    id: "18",
    text: "Take a photo from an unusual angle",
    type: "photo",
  },
  {
    id: "19",
    text: "List 3 things you're grateful for today",
    type: "text",
    placeholder: "1. ... 2. ... 3. ...",
  },
  {
    id: "20",
    text: "Draw your current mood using only shapes",
    type: "drawing",
  },
  {
    id: "21",
    text: "Capture a reflection in a photo",
    type: "photo",
  },
  {
    id: "22",
    text: "Find a song that makes you want to dance",
    type: "spotify",
  },
  {
    id: "23",
    text: "Share one thing that made you laugh today",
    type: "video",
  },
  {
    id: "24",
    text: "Doodle what you hear right now",
    type: "drawing",
  },
  {
    id: "25",
    text: "Take a photo of something that makes you smile",
    type: "photo",
  },
  {
    id: "26",
    text: "Write a 6-word story",
    type: "text",
    placeholder: "Six words that tell a complete story...",
  },
  {
    id: "27",
    text: "Find a song in a language you don't speak",
    type: "spotify",
  },
  {
    id: "28",
    text: "Describe your perfect day in 3 sentences",
    type: "text",
    placeholder: "What would make today perfect?",
  },
  {
    id: "29",
    text: "Draw your day as a 3-panel comic strip",
    type: "drawing",
  },
  {
    id: "30",
    text: "Find your favorite color in nature and photograph it",
    type: "photo",
  },
  {
    id: "31",
    text: "Give a 30-second tour of your favorite space",
    type: "video",
  },
  {
    id: "32",
    text: "Find a song that gives you energy",
    type: "spotify",
  },
  {
    id: "33",
    text: "Create a new word and define it",
    type: "text",
    placeholder: "Your new word: ... Definition: ...",
  },
  {
    id: "34",
    text: "Capture a photo of an interesting shadow",
    type: "photo",
  },
  {
    id: "35",
    text: "Sketch your dream vacation spot",
    type: "drawing",
  },
  {
    id: "36",
    text: "Write a message to your past self from one year ago",
    type: "text",
    placeholder: "Dear past me, ...",
  },
  {
    id: "37",
    text: "Teach someone something new in under a minute",
    type: "video",
  },
  {
    id: "38",
    text: "Find a song that helps you focus",
    type: "spotify",
  },
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
