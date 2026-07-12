import { create } from 'zustand';
import { SRSData, calculateSM2, calculateNextReviewDate } from '../core/srs/sm2';

export interface VocabCard {
  id: string;
  front: string;
  back: string;
  context: string;
  srsData: SRSData;
  nextReviewDate: string; // ISO string
}

const EXPANDED_DECK: VocabCard[] = [
  // Unit 1: The Basics
  { id: 'v1', front: 'Hola', back: 'Hello', context: '¡Hola! ¿Cómo estás?', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v2', front: 'Adiós', back: 'Goodbye', context: 'Adiós, hasta mañana.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v3', front: 'Por favor', back: 'Please', context: 'Un café, por favor.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v4', front: 'Gracias', back: 'Thank you', context: 'Muchas gracias por tu ayuda.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  
  // Unit 2: Daily Life
  { id: 'v5', front: 'La madre', back: 'The mother', context: 'Mi madre es muy amable.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v6', front: 'El padre', back: 'The father', context: 'El padre de Juan trabaja aquí.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v7', front: 'Trabajar', back: 'To work', context: 'Yo trabajo todos los días.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  
  // Unit 3: Food & Dining
  { id: 'v8', front: 'El agua', back: 'The water', context: 'Necesito un vaso de agua.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v9', front: 'La cuenta', back: 'The bill', context: 'La cuenta, por favor.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v10', front: 'Comer', back: 'To eat', context: 'Me gusta comer paella.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },

  // Unit 4: Travel & Directions (A2)
  { id: 'v11', front: 'La calle', back: 'The street', context: '¿Dónde está la calle principal?', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v12', front: 'El tren', back: 'The train', context: 'El tren llega a las ocho.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v13', front: 'El aeropuerto', back: 'The airport', context: 'Voy al aeropuerto ahora.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },

  // Unit 5: Health (A2)
  { id: 'v14', front: 'El médico', back: 'The doctor', context: 'Necesito ver a un médico.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
  { id: 'v15', front: 'La cabeza', back: 'The head', context: 'Me duele la cabeza.', srsData: { repetition: 0, interval: 0, easinessFactor: 2.5 }, nextReviewDate: new Date().toISOString() },
];

type VocabState = {
  deck: VocabCard[];
  getDueCards: () => VocabCard[];
  reviewCard: (id: string, quality: number) => void;
  sync: (uid: string) => Promise<void>;
};

export const useVocabStore = create<VocabState>((set, get) => ({
  deck: EXPANDED_DECK,
  
  getDueCards: () => {
    const now = new Date();
    return get().deck.filter(card => new Date(card.nextReviewDate) <= now);
  },

  reviewCard: (id, quality) => {
    set((state) => {
      const newDeck = state.deck.map(card => {
        if (card.id === id) {
          const newSrsData = calculateSM2(quality, card.srsData);
          return {
            ...card,
            srsData: newSrsData,
            nextReviewDate: calculateNextReviewDate(newSrsData.interval)
          };
        }
        return card;
      });
      return { deck: newDeck };
    });
  },

  sync: async (uid) => {
    const { FirebaseService } = await import('../services/firebase');
    await FirebaseService.syncUserData(uid, { deck: get().deck });
  }
}));
