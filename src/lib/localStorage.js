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
    const parsedSubjects = subjects ? JSON.parse(subjects) : [];
    console.log('Materias cargadas:', parsedSubjects);
    return parsedSubjects;
};

export const addSubject = (subject) => {
    const subjects = getSubjects();
    const newSubject = {
        id: Date.now().toString(),
        name: subject.name,
        created_at: new Date().toISOString()
    };
    subjects.push(newSubject);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    console.log('Materia agregada:', newSubject);
    return newSubject;
};

export const updateSubject = (id, updates) => {
    const subjects = getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updates };
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
        console.log('Materia actualizada:', subjects[index]);
        return subjects[index];
    }
    return null;
};

export const deleteSubject = (id) => {
    const subjects = getSubjects();
    const filteredSubjects = subjects.filter(s => s.id !== id);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(filteredSubjects));
    console.log('Materia eliminada:', id);

    // También eliminamos las tarjetas asociadas
    const cards = getCards();
    const filteredCards = cards.filter(c => c.subject_id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
    console.log('Tarjetas eliminadas para la materia:', id);
};

// Funciones para manejar tarjetas
export const getCards = () => {
    const cards = localStorage.getItem(CARDS_KEY);
    const parsedCards = cards ? JSON.parse(cards) : [];
    console.log('Tarjetas cargadas:', parsedCards);
    return parsedCards;
};

export const addCard = (card) => {
    const cards = getCards();
    const newCard = {
        id: Date.now().toString(),
        subject_id: card.subject_id,
        question: card.question,
        type: card.type || 'single',
        options: card.options || [],
        answer: card.answer || '',
        hint: card.hint || '',
        solution: card.solution || '',
        created_at: new Date().toISOString()
    };
    cards.push(newCard);
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    console.log('Tarjeta agregada:', newCard);
    return newCard;
};

export const updateCard = (id, updates) => {
    const cards = getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
        console.log('Tarjeta actualizada:', cards[index]);
        return cards[index];
    }
    return null;
};

export const deleteCard = (id) => {
    const cards = getCards();
    const filteredCards = cards.filter(c => c.id !== id);
    localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
    console.log('Tarjeta eliminada:', id);
}; 