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

// Weitere Hilfsfunktionen können hier hinzugefügt werden
