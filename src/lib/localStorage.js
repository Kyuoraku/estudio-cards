// src/lib/localStorage.js

const SUBJECTS_KEY = 'estudio-cards-subjects';
const CARDS_KEY = 'estudio-cards-cards';

// Funciones para manejar materias
export const getSubjects = () => {
    const subjects = localStorage.getItem('estudio-cards-subjects');
    return subjects ? JSON.parse(subjects) : [];
};

export const addSubject = (subject) => {
    const subjects = getSubjects();
    const newSubject = {
        id: Date.now().toString(),
        name: subject.name,
        created_at: new Date().toISOString()
    };
    subjects.push(newSubject);
    localStorage.setItem('estudio-cards-subjects', JSON.stringify(subjects));
    return newSubject;
};

export const updateSubject = (id, updates) => {
    const subjects = getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updates };
        localStorage.setItem('estudio-cards-subjects', JSON.stringify(subjects));
        return subjects[index];
    }
    return null;
};

export const deleteSubject = (id) => {
    const subjects = getSubjects();
    const filteredSubjects = subjects.filter(s => s.id !== id);
    localStorage.setItem('estudio-cards-subjects', JSON.stringify(filteredSubjects));

    // También eliminamos las tarjetas asociadas
    const cards = getCards();
    const filteredCards = cards.filter(c => c.subject_id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
};

// Funciones para manejar tarjetas
export const getCards = (subjectId = null) => {
    const cards = localStorage.getItem('estudio-cards-cards');
    const parsedCards = cards ? JSON.parse(cards) : [];
    return subjectId ? parsedCards.filter(c => c.subject_id === subjectId) : parsedCards;
};

export const addCard = (card) => {
    const cards = getCards();
    const newCard = {
        id: Date.now().toString(),
        subject_id: card.subject_id,
        question: card.question,
        type: card.type || 'single',
        options: card.options || [],
        answer: card.answer,
        hint: card.hint || '',
        solution: card.solution || '',
        created_at: new Date().toISOString()
    };
    cards.push(newCard);
    localStorage.setItem('estudio-cards-cards', JSON.stringify(cards));
    return newCard;
};

export const updateCard = (id, updates) => {
    const cards = getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        localStorage.setItem('estudio-cards-cards', JSON.stringify(cards));
        return cards[index];
    }
    return null;
};

export const deleteCard = (id) => {
    const cards = getCards();
    const filteredCards = cards.filter(c => c.id !== id);
    localStorage.setItem('estudio-cards-cards', JSON.stringify(filteredCards));
}; 