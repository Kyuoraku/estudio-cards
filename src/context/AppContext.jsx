import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSubjects, addSubject, updateSubject, deleteSubject, getCards, addCard, updateCard, deleteCard } from '../lib/localStorage';
import { AppContext } from './context';

export const AppProvider = ({ children }) => {
    const [subjects, setSubjects] = useState(getSubjects());
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            const loadedCards = getCards();
            setCards(loadedCards);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleAddSubject = useCallback((name, color) => {
        const newSubject = addSubject(name, color);
        setSubjects(getSubjects());
        return newSubject;
    }, []);

    const handleUpdateSubject = useCallback((id, updates) => {
        const updatedSubject = updateSubject(id, updates);
        setSubjects(subjects.map(s => s.id === id ? updatedSubject : s));
    }, [subjects]);

    const handleDeleteSubject = useCallback((id) => {
        deleteSubject(id);
        setSubjects(getSubjects());
    }, []);

    const handleAddCard = useCallback((card) => {
        const newCard = addCard(card);
        setCards(prevCards => [...prevCards, newCard]);
        return newCard;
    }, []);

    const handleUpdateCard = useCallback((id, updates) => {
        const updatedCard = updateCard(id, updates);
        setCards(cards.map(c => c.id === id ? updatedCard : c));
    }, [cards]);

    const handleDeleteCard = useCallback((id) => {
        deleteCard(id);
        setCards(cards.filter(c => c.id !== id));
    }, [cards]);

    const handleGetSubjectCards = useCallback((subjectId) => {
        return cards.filter(card => card.subject_id === subjectId);
    }, [cards]);

    const value = useMemo(() => ({
        subjects,
        cards,
        addSubject: handleAddSubject,
        updateSubject: handleUpdateSubject,
        deleteSubject: handleDeleteSubject,
        addCard: handleAddCard,
        updateCard: handleUpdateCard,
        deleteCard: handleDeleteCard,
        getSubjectCards: handleGetSubjectCards
    }), [
        subjects,
        cards,
        handleAddSubject,
        handleUpdateSubject,
        handleDeleteSubject,
        handleAddCard,
        handleUpdateCard,
        handleDeleteCard,
        handleGetSubjectCards
    ]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

AppProvider.propTypes = {
    children: PropTypes.node.isRequired
}; 