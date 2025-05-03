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
        // Primero eliminamos todas las cards asociadas a la materia
        const subjectCards = cards.filter(c => c.subject_id === id);
        subjectCards.forEach(card => {
            deleteCard(card.id);
        });

        // Luego eliminamos la materia
        deleteSubject(id);
        setSubjects(subjects.filter(s => s.id !== id));
        setCards(cards.filter(c => c.subject_id !== id));
    };

    const handleAddCard = (card) => {
        console.log('Agregando tarjeta:', card);
        const newCard = addCard(card);
        console.log('Tarjeta agregada:', newCard);
        setCards(prevCards => [...prevCards, newCard]);
    };

    const handleUpdateCard = (id, updates) => {
        console.log('Actualizando tarjeta:', { id, updates });
        const updatedCard = updateCard(id, updates);
        console.log('Tarjeta actualizada:', updatedCard);
        setCards(cards.map(c => c.id === id ? updatedCard : c));
    };

    const handleDeleteCard = (id) => {
        console.log('Eliminando tarjeta:', id);
        deleteCard(id);
        setCards(cards.filter(c => c.id !== id));
    };

    const getSubjectCards = (subjectId) => {
        console.log('Buscando tarjetas para la materia:', subjectId);
        console.log('Todas las tarjetas:', cards);
        const filteredCards = cards.filter(card => card.subject_id === subjectId);
        console.log('Tarjetas filtradas:', filteredCards);
        return filteredCards;
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