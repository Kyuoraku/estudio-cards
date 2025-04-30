import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../lib/localStorage';
import { getCards, addCard, updateCard, deleteCard } from '../lib/localStorage';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe ser usado dentro de un AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [subjects, setSubjects] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            const loadedSubjects = getSubjects();
            const loadedCards = getCards();
            setSubjects(loadedSubjects);
            setCards(loadedCards);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleAddSubject = (subject) => {
        const newSubject = addSubject(subject);
        setSubjects([...subjects, newSubject]);
    };

    const handleUpdateSubject = (id, updates) => {
        const updatedSubject = updateSubject(id, updates);
        setSubjects(subjects.map(s => s.id === id ? updatedSubject : s));
    };

    const handleDeleteSubject = (id) => {
        deleteSubject(id);
        setSubjects(subjects.filter(s => s.id !== id));
        // También eliminamos las tarjetas asociadas
        const subjectCards = cards.filter(c => c.subject_id === id);
        subjectCards.forEach(card => handleDeleteCard(card.id));
    };

    const handleAddCard = (card) => {
        const newCard = addCard(card);
        setCards([...cards, newCard]);
    };

    const handleUpdateCard = (id, updates) => {
        const updatedCard = updateCard(id, updates);
        setCards(cards.map(c => c.id === id ? updatedCard : c));
    };

    const handleDeleteCard = (id) => {
        deleteCard(id);
        setCards(cards.filter(c => c.id !== id));
    };

    const getSubjectCards = (subjectId) => {
        return cards.filter(card => card.subject_id === subjectId);
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <AppContext.Provider value={{
            subjects,
            cards,
            addSubject: handleAddSubject,
            updateSubject: handleUpdateSubject,
            deleteSubject: handleDeleteSubject,
            addCard: handleAddCard,
            updateCard: handleUpdateCard,
            deleteCard: handleDeleteCard,
            getSubjectCards
        }}>
            {children}
        </AppContext.Provider>
    );
}; 