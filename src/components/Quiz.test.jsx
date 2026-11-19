import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import Quiz from './Quiz';
import { useApp } from '../hooks/useApp';
import { renderWithProviders, seedStorage, sampleSubjects, sampleCards } from '../test/utils';

const renderQuiz = (subjectId, extra = null) =>
    renderWithProviders(<><Quiz />{extra}</>, { route: `/quiz/${subjectId}`, path: '/quiz/:id' });

// Math.random devuelve los valores indicados en orden (el último se repite).
const mockRandom = (...values) => {
    let i = 0;
    return vi.spyOn(Math, 'random').mockImplementation(() => values[Math.min(i++, values.length - 1)]);
};

const [historyCard1, historyCard2] = sampleCards;
const optionButton = (title) => screen.getByRole('button', { name: title });

// Agrega una tarjeta a la materia s1 a través del contexto (simula un alta mientras el quiz está abierto).
const AddCardButton = () => {
    const { addCard } = useApp();
    return <button onClick={() => addCard({ ...historyCard1, id: undefined })}>agregar tarjeta</button>;
};

const GoToSubjectButton = ({ subjectId }) => {
    const navigate = useNavigate();
    return <button onClick={() => navigate(`/quiz/${subjectId}`)}>ir a {subjectId}</button>;
};

// Specs: specs/06-quiz.md
describe('Quiz (ruta /quiz/:id)', () => {
    it('[QUIZ-10] sin tarjetas muestra un mensaje y "← Volver" lleva a la materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: [] });
        renderQuiz('s1');

        expect(screen.getByText('No hay tarjetas para hacer el quiz.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/subject/s1');
    });

    it('[QUIZ-10] con tarjetas muestra "← Volver" que lleva a la materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        expect(screen.queryByText('No hay tarjetas para hacer el quiz.')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/subject/s1');
    });

    it('[QUIZ-10] con tarjetas muestra al entrar una pregunta de la materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        const questions = [historyCard1.question, historyCard2.question];
        expect(screen.getByRole('heading', { name: (name) => questions.includes(name) })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Siguiente pregunta' })).not.toBeInTheDocument();
    });

    it('[QUIZ-10] elige la tarjeta al azar y muestra una opción por botón', () => {
        mockRandom(0.99);
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        expect(screen.getByRole('heading', { name: historyCard2.question })).toBeInTheDocument();
        for (const option of historyCard2.options) {
            expect(optionButton(option.title)).toBeEnabled();
        }
        expect(screen.queryByText(sampleCards[2].question)).not.toBeInTheDocument();
    });

    it('[QUIZ-10] responder bien marca la opción en verde y deshabilita las opciones', () => {
        mockRandom(0);
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        fireEvent.click(optionButton('1810'));

        expect(optionButton('1810')).toHaveClass('MuiButton-containedSuccess');
        expect(optionButton('1816')).toHaveClass('MuiButton-outlinedPrimary');
        expect(optionButton('1853')).toHaveClass('MuiButton-outlinedPrimary');
        for (const option of historyCard1.options) {
            expect(optionButton(option.title)).toBeDisabled();
        }
        expect(screen.getByRole('button', { name: 'Siguiente pregunta' })).toBeInTheDocument();
    });

    it('[QUIZ-10] responder mal marca la elegida en rojo y la correcta en verde', () => {
        mockRandom(0);
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        fireEvent.click(optionButton('1816'));

        expect(optionButton('1816')).toHaveClass('MuiButton-containedError');
        expect(optionButton('1810')).toHaveClass('MuiButton-outlinedSuccess');
        expect(optionButton('1853')).toHaveClass('MuiButton-outlinedPrimary');
        expect(optionButton('1810')).toBeDisabled();
    });

    it('[QUIZ-10] "Siguiente pregunta" muestra otra tarjeta con la respuesta reiniciada', () => {
        mockRandom(0, 0.99);
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        expect(screen.getByRole('heading', { name: historyCard1.question })).toBeInTheDocument();
        fireEvent.click(optionButton('1810'));
        fireEvent.click(screen.getByRole('button', { name: 'Siguiente pregunta' }));

        expect(screen.getByRole('heading', { name: historyCard2.question })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Siguiente pregunta' })).not.toBeInTheDocument();
        for (const option of historyCard2.options) {
            expect(optionButton(option.title)).toBeEnabled();
            expect(optionButton(option.title)).toHaveClass('MuiButton-outlinedPrimary');
        }
    });

    it('[QUIZ-10] si la materia pasa de no tener tarjetas a tenerlas, muestra una pregunta', () => {
        seedStorage({ subjects: sampleSubjects, cards: [] });
        renderQuiz('s1', <AddCardButton />);

        expect(screen.getByText('No hay tarjetas para hacer el quiz.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'agregar tarjeta' }));

        expect(screen.queryByText('No hay tarjetas para hacer el quiz.')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: historyCard1.question })).toBeInTheDocument();
    });

    it('[QUIZ-10] al cambiar de materia en la misma página muestra una pregunta de la nueva materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1', <GoToSubjectButton subjectId="s2" />);

        fireEvent.click(screen.getByRole('button', { name: 'ir a s2' }));

        expect(screen.getByTestId('location')).toHaveTextContent('/quiz/s2');
        expect(screen.getByRole('heading', { name: sampleCards[2].question })).toBeInTheDocument();
    });
});
