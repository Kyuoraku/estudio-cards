import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubjects, addSubject, updateSubject, deleteSubject, getCards, addCard, updateCard, deleteCard } from '../lib/localStorage';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [subjects, setSubjects] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = () => {
        const subjectsData = getSubjects();
        const cardsData = getCards();
        setSubjects(subjectsData);
        setCards(cardsData);
        setLoading(false);
    };

    // Funciones para manejar materias
    const handleAddSubject = (subjectData) => {
        const newSubject = addSubject(subjectData);
        setSubjects(prev => [...prev, newSubject]);
        return newSubject;
    };

    const handleUpdateSubject = (id, updates) => {
        const updatedSubject = updateSubject(id, updates);
        if (updatedSubject) {
            setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
        }
        return updatedSubject;
    };

    const handleDeleteSubject = (id) => {
        deleteSubject(id);
        setSubjects(prev => prev.filter(s => s.id !== id));
        setCards(prev => prev.filter(c => c.subject_id !== id));
    };

    // Funciones para manejar tarjetas
    const handleAddCard = (cardData) => {
        const newCard = addCard(cardData);
        setCards(prev => [...prev, newCard]);
        return newCard;
    };

    const handleUpdateCard = (id, updates) => {
        const updatedCard = updateCard(id, updates);
        if (updatedCard) {
            setCards(prev => prev.map(c => c.id === id ? updatedCard : c));
        }
        return updatedCard;
    };

    const handleDeleteCard = (id) => {
        deleteCard(id);
        setCards(prev => prev.filter(c => c.id !== id));
    };

    const getSubjectCards = (subjectId) => {
        return cards.filter(card => card.subject_id === subjectId);
    };

    const value = {
        subjects,
        cards,
        loading,
        addSubject: handleAddSubject,
        updateSubject: handleUpdateSubject,
        deleteSubject: handleDeleteSubject,
        addCard: handleAddCard,
        updateCard: handleUpdateCard,
        deleteCard: handleDeleteCard,
        getSubjectCards
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe ser usado dentro de un AppProvider');
    }
    return context;
} 