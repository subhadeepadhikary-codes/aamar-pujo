// Authentic, 100% real photographs of traditional Maa Durga clay idols from Kumartuli & Kolkata Rajbaris
// STRICTLY NON-AI generated photographs

export const DURGA_FACE_IMAGES = [
  "/images/durga/durga_face_1.jpg",
  "/images/durga/durga_face_2.jpg",
  "/images/durga/durga_face_3.jpg",
  "/images/durga/durga_face_4.jpg",
  "/images/durga/durga_face_5.jpg"
];

/**
 * Returns a deterministic authentic Durga face based on an item ID or index.
 */
export function getDurgaFace(seed = 0) {
  const num = typeof seed === "number" ? Math.abs(seed) : String(seed).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DURGA_FACE_IMAGES[num % DURGA_FACE_IMAGES.length];
}

/**
 * Returns a random authentic Durga face.
 */
export function getRandomDurgaFace() {
  const idx = Math.floor(Math.random() * DURGA_FACE_IMAGES.length);
  return DURGA_FACE_IMAGES[idx];
}
