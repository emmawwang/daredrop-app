// Dare types
export type DareType = "photo" | "text";

export interface Dare {
  id: string;
  text: string;
  type: DareType;
  placeholder?: string; // For text dares, the placeholder text in the input
}

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
    text: "Design a logo for an imaginary company using only circles",
    type: "photo",
  },
  {
    id: "4",
    text: "Write a letter to your future self 5 years from now",
    type: "text",
    placeholder: "What do you want to tell your future self?",
  },
  {
    id: "5",
    text: "Sketch your favorite place from memory",
    type: "photo",
  },
  {
    id: "6",
    text: "Create a playlist of 5 songs that tell a story",
    type: "text",
    placeholder: "List the songs and explain the story they tell together...",
  },
  {
    id: "7",
    text: "Draw a self-portrait using only geometric shapes",
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
    text: "Create a collage using only things you find in your kitchen",
    type: "photo",
  },
  {
    id: "10",
    text: "Compose a haiku about your morning coffee",
    type: "text",
    placeholder: "5 syllables, 7 syllables, 5 syllables...",
  },
];

/**
 * Get a random dare from the list, optionally excluding a specific dare
 */
export function getRandomDare(excludeDareText?: string): Dare {
  const availableDares = excludeDareText
    ? sampleDares.filter((d) => d.text !== excludeDareText)
    : sampleDares;

  if (availableDares.length === 0) {
    // Fallback if somehow all dares are excluded
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
