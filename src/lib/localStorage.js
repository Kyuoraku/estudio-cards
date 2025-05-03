// src/lib/localStorage.js

const SUBJECTS_KEY = 'estudio-cards-subjects';
const CARDS_KEY = 'estudio-cards-cards';

// Helper para traducir tipos de respuesta
export const getCardTypeLabel = (type) => {
    const types = {
        'single': 'Respuesta única',
        'multiple': 'Respuesta múltiple',
        'fill': 'Completar palabras'
    };
    return types[type] || type;
};

// Funciones para manejar materias
export const getSubjects = () => {
    const subjects = localStorage.getItem(SUBJECTS_KEY);
    return subjects ? JSON.parse(subjects) : [];
};

export const addSubject = (subject) => {
    const subjects = getSubjects();
    const newSubject = {
        id: Date.now().toString(),
        name: subject.name,
        color: subject.color
    };
    subjects.push(newSubject);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    return newSubject;
};

export const updateSubject = (id, updates) => {
    const subjects = getSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex !== -1) {
        subjects[subjectIndex] = { ...subjects[subjectIndex], ...updates };
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
        return subjects[subjectIndex];
    }
    return null;
};

export const deleteSubject = (id) => {
    const subjects = getSubjects();
    const updatedSubjects = subjects.filter(s => s.id !== id);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updatedSubjects));

    // También eliminamos las tarjetas asociadas
    const cards = getCards();
    const filteredCards = cards.filter(c => c.subject_id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
    console.log('Tarjetas eliminadas para la materia:', id);
};

// Funciones para manejar tarjetas
export const getCards = () => {
    const cards = localStorage.getItem(CARDS_KEY);
    return cards ? JSON.parse(cards) : [];
};

export const addCard = (card) => {
    const cards = getCards();
    const newCard = {
        id: Date.now().toString(),
        subject_id: card.subject_id,
        question: card.question,
        options: card.options
    };
    cards.push(newCard);
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    return newCard;
};

export const updateCard = (id, updates) => {
    const cards = getCards();
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cardIndex !== -1) {
        cards[cardIndex] = { ...cards[cardIndex], ...updates };
        localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
        return cards[cardIndex];
    }
    return null;
};

export const deleteCard = (id) => {
    const cards = getCards();
    const updatedCards = cards.filter(c => c.id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(updatedCards));
    console.log('Tarjeta eliminada:', id);
}; 