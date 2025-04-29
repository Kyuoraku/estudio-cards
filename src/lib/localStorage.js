// src/lib/localStorage.js

const SUBJECTS_KEY = 'estudio-cards-subjects';
const CARDS_KEY = 'estudio-cards-cards';

// Funciones para manejar materias
export const getSubjects = () => {
    const subjects = localStorage.getItem(SUBJECTS_KEY);
    return subjects ? JSON.parse(subjects) : [];
};

export const addSubject = (subject) => {
    const subjects = getSubjects();
    const newSubject = {
        ...subject,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
    };
    subjects.push(newSubject);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    return newSubject;
};

export const updateSubject = (id, updates) => {
    const subjects = getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updates };
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
        return subjects[index];
    }
    return null;
};

export const deleteSubject = (id) => {
    const subjects = getSubjects();
    const filteredSubjects = subjects.filter(s => s.id !== id);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(filteredSubjects));

    // También eliminamos las tarjetas asociadas
    const cards = getCards();
    const filteredCards = cards.filter(c => c.subject_id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
};

// Funciones para manejar tarjetas
export const getCards = (subjectId = null) => {
    const cards = localStorage.getItem(CARDS_KEY);
    const parsedCards = cards ? JSON.parse(cards) : [];
    return subjectId
        ? parsedCards.filter(c => c.subject_id === subjectId)
        : parsedCards;
};

export const addCard = (card) => {
    const cards = getCards();
    const newCard = {
        ...card,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
    };
    cards.push(newCard);
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    return newCard;
};

export const updateCard = (id, updates) => {
    const cards = getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
        return cards[index];
    }
    return null;
};

export const deleteCard = (id) => {
    const cards = getCards();
    const filteredCards = cards.filter(c => c.id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
}; 