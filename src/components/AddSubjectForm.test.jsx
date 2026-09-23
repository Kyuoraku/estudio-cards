import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import AddSubjectForm from './AddSubjectForm';
import { readSubjects } from '../test/utils';

const renderForm = (onClose = vi.fn()) => {
    render(
        <AppProvider>
            <AddSubjectForm onClose={onClose} />
        </AppProvider>
    );
    return onClose;
};

// Specs: specs/04-materias.md
describe('AddSubjectForm', () => {
    it('[SUBJ-01] muestra el campo de nombre con foco y los botones', () => {
        renderForm();
        const input = screen.getByLabelText('Nombre de la materia');
        expect(input).toHaveAttribute('placeholder', 'Ej: Matemáticas');
        expect(input).toHaveFocus();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Agregar materia' })).toBeInTheDocument();
    });

    it('[SUBJ-01] crea la materia con el nombre ingresado y cierra', () => {
        vi.spyOn(Date, 'now').mockReturnValue(500);
        const onClose = renderForm();

        fireEvent.change(screen.getByLabelText('Nombre de la materia'), { target: { value: 'Química' } });
        fireEvent.click(screen.getByRole('button', { name: 'Agregar materia' }));

        expect(readSubjects()).toEqual([{ id: '500', name: 'Química' }]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[SUBJ-01] enviar con Enter también crea la materia', () => {
        const onClose = renderForm();
        const input = screen.getByLabelText('Nombre de la materia');

        fireEvent.change(input, { target: { value: 'Física' } });
        fireEvent.submit(input.closest('form'));

        expect(readSubjects().map(s => s.name)).toEqual(['Física']);
        expect(onClose).toHaveBeenCalled();
    });

    it.each(['', '   '])('[SUBJ-02] ignora nombres vacíos o en blanco (%j) y no cierra', (value) => {
        const onClose = renderForm();

        fireEvent.change(screen.getByLabelText('Nombre de la materia'), { target: { value } });
        fireEvent.click(screen.getByRole('button', { name: 'Agregar materia' }));

        expect(readSubjects()).toEqual([]);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('[SUBJ-03] Cancelar cierra sin crear la materia', () => {
        const onClose = renderForm();

        fireEvent.change(screen.getByLabelText('Nombre de la materia'), { target: { value: 'Química' } });
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(readSubjects()).toEqual([]);
    });
});
