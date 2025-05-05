
/**
 * Utilità per la gestione degli slot temporali
 * 
 * Questo file contiene funzioni di supporto per gestire gli slot temporali
 * disponibili e prenotati nel sistema di pianificazione degli esercizi.
 */

// Slot temporali predefiniti disponibili nel sistema
export const allTimeSlots = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00"
];

/**
 * Ottiene gli slot temporali disponibili filtrando quelli già prenotati
 * 
 * @param bookedTimeSlots Array di slot temporali già prenotati
 * @returns Array di slot temporali disponibili
 */
export const getAvailableTimeSlots = (
  bookedTimeSlots: string[] = []
): string[] => {
  return allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
};
