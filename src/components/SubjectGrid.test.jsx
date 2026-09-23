import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import SubjectGrid from './SubjectGrid';
import { renderWithProviders, seedStorage, sampleSubjects } from '../test/utils';

// Specs: specs/04-materias.md
describe('SubjectGrid', () => {
    it('[SUBJ-04] muestra un mensaje cuando no hay materias', () => {
        renderWithProviders(<SubjectGrid />);
        expect(screen.getByText('No hay materias agregadas aún.')).toBeInTheDocument();
        expect(screen.getByText('Haz clic en "Agregar nuevas materias" para comenzar.')).toBeInTheDocument();
    });

    it('[SUBJ-04] muestra una tarjeta por materia, en el orden guardado', () => {
        seedStorage({ subjects: sampleSubjects });
        renderWithProviders(<SubjectGrid />);

        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.map(h => h.textContent)).toEqual(['Historia', 'Biología']);
        expect(screen.queryByText('No hay materias agregadas aún.')).not.toBeInTheDocument();
    });

    it('[SUBJ-04] cada materia ofrece botón Quiz y botón eliminar', () => {
        seedStorage({ subjects: sampleSubjects });
        renderWithProviders(<SubjectGrid />);

        expect(screen.getAllByRole('button', { name: 'Quiz' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'eliminar materia' })).toHaveLength(2);
        const firstCard = screen.getByText('Historia').closest('.MuiCard-root');
        expect(within(firstCard).getByRole('button', { name: 'Quiz' })).toBeInTheDocument();
    });
});
