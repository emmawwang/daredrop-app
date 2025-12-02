// Sample dares - these will later be fetched from an API or database
export const sampleDares = [
  "Take a photo of something beautiful!",
  "Design a logo for an imaginary company using only circles",
  "Write a letter to your future self 5 years from now",
  "Sketch your favorite place from memory",
  "Create a playlist of 5 songs that tell a story",
  "Build something useful from recycled materials",
  "Draw a self-portrait using only geometric shapes",
  "Write a 50-word story that ends with the word 'finally'",
  "Create a collage using only things you find in your kitchen",
  "Compose a haiku about your morning coffee",
];

/**
 * Get a random dare from the list, optionally excluding a specific dare
 */
export function getRandomDare(excludeDare?: string): string {
  const availableDares = excludeDare
    ? sampleDares.filter((d) => d !== excludeDare)
    : sampleDares;

  if (availableDares.length === 0) {
    // Fallback if somehow all dares are excluded
    return sampleDares[Math.floor(Math.random() * sampleDares.length)];
  }

  return availableDares[Math.floor(Math.random() * availableDares.length)];
}

