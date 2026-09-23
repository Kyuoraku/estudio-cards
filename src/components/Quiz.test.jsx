import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Quiz from './Quiz';
import { renderWithProviders, seedStorage, sampleSubjects, sampleCards } from '../test/utils';

const renderQuiz = (subjectId) =>
    renderWithProviders(<Quiz />, { route: `/quiz/${subjectId}`, path: '/quiz/:id' });

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

    // BUG-01: nunca se elige una primera tarjeta, así que la página solo muestra "← Volver".
    it.fails('[BUG-01] con tarjetas debería mostrar una pregunta de la materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderQuiz('s1');

        const questions = [sampleCards[0].question, sampleCards[1].question];
        expect(screen.getByRole('heading', { name: (name) => questions.includes(name) })).toBeInTheDocument();
    });
});
