/**
 * Hilfsfunktionen für das Minesweeper-Projekt
 */

/**
 * Gibt eine zufällige ganze Zahl zwischen min und max (inklusiv) zurück.
 * @param min Minimaler Wert
 * @param max Maximaler Wert
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Erstellt eine tiefe Kopie eines Objekts
 * @param obj Das zu klonende Objekt
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Verzögert die Ausführung um die angegebene Zeit in Millisekunden
 * @param ms Zeit in Millisekunden
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/** 
 * Erstellt die invertirte Farbe eines gegebenen Farbwertes
 * @param color Der zu invertierende Farbwert
 */
export function invertColor(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse each color channel and invert it
  const r = (255 - parseInt(hex.substring(0, 2), 16))
    .toString(16)
    .padStart(2, "0");
  const g = (255 - parseInt(hex.substring(2, 4), 16))
    .toString(16)
    .padStart(2, "0");
  const b = (255 - parseInt(hex.substring(4, 6), 16))
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`;
}
// Weitere Hilfsfunktionen können hier hinzugefügt werden
