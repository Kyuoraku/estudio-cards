import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import SubjectCard from './SubjectCard';
import {
    renderWithProviders,
    seedStorage,
    readSubjects,
    readCards,
    sampleSubjects,
    sampleCards,
} from '../test/utils';

const subject = sampleSubjects[0];

const renderCard = () => {
    seedStorage({ subjects: sampleSubjects, cards: sampleCards });
    return renderWithProviders(<SubjectCard subject={subject} />);
};

// Specs: specs/04-materias.md
describe('SubjectCard', () => {
    it('[SUBJ-04] muestra el nombre de la materia', () => {
        renderCard();
        expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
    });

    it('[SUBJ-05] clic en la tarjeta navega a /subject/:id', () => {
        renderCard();
        fireEvent.click(screen.getByText('Historia'));
        expect(screen.getByTestId('location')).toHaveTextContent('/subject/s1');
    });

    it('[QUIZ-10] el botón Quiz navega a /quiz/:id (sin abrir la materia)', () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'Quiz' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/quiz/s1');
    });

    it('[SUBJ-06] el botón eliminar abre un diálogo de confirmación sin navegar', () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'eliminar materia' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Eliminar materia')).toBeInTheDocument();
        expect(
            screen.getByText('¿Estás seguro que deseas eliminar la materia "Historia"? Esta acción no se puede deshacer.')
        ).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });

    it('[SUBJ-06] Cancelar cierra el diálogo sin eliminar', async () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'eliminar materia' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(readSubjects()).toEqual(sampleSubjects);
    });

    it('[SUBJ-06] Eliminar borra la materia y sus tarjetas', async () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'eliminar materia' }));
        fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

        expect(readSubjects()).toEqual([sampleSubjects[1]]);
        expect(readCards().map(c => c.id)).toEqual(['c3']);
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });
});
