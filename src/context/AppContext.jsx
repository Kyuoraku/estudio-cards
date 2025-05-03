import React, { useState, useEffect, useMemo } from 'react';
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

    const value = useMemo(() => ({
        subjects,
        cards,
        addSubject: (name, color) => {
            const newSubject = addSubject(name, color);
            setSubjects(getSubjects());
            return newSubject;
        },
        updateSubject: (id, updates) => {
            const updatedSubject = updateSubject(id, updates);
            setSubjects(subjects.map(s => s.id === id ? updatedSubject : s));
        },
        deleteSubject: (id) => {
            deleteSubject(id);
            setSubjects(getSubjects());
        },
        addCard: (card) => {
            console.log('Agregando tarjeta:', card);
            const newCard = addCard(card);
            console.log('Tarjeta agregada:', newCard);
            setCards(prevCards => [...prevCards, newCard]);
        },
        updateCard: (id, updates) => {
            console.log('Actualizando tarjeta:', { id, updates });
            const updatedCard = updateCard(id, updates);
            console.log('Tarjeta actualizada:', updatedCard);
            setCards(cards.map(c => c.id === id ? updatedCard : c));
        },
        deleteCard: (id) => {
            console.log('Eliminando tarjeta:', id);
            deleteCard(id);
            setCards(cards.filter(c => c.id !== id));
        },
        getSubjectCards: (subjectId) => {
            console.log('Buscando tarjetas para la materia:', subjectId);
            console.log('Todas las tarjetas:', cards);
            const filteredCards = cards.filter(card => card.subject_id === subjectId);
            console.log('Tarjetas filtradas:', filteredCards);
            return filteredCards;
        }
    }), [subjects, cards]);

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