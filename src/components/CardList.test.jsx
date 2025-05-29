import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import CardList from './CardList';

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('CardList', () => {
    const mockCards = [
        {
            id: '1',
            subject_id: '1',
            question: '¿Cuál es la capital de Francia?',
            type: 'single',
            options: [
                { title: 'París', isCorrect: false },
                { title: 'Londres', isCorrect: false },
                { title: 'Madrid', isCorrect: false }
            ]
        }
    ];

    const mockSubjects = [
        {
            id: '1',
            name: 'test',
            color: '#000000'
        }
    ];

    const renderCardList = () => {
        return render(
            <BrowserRouter>
                <AppProvider>
                    <CardList />
                </AppProvider>
            </BrowserRouter>
        );
    };

    it('debería mostrar un mensaje cuando no hay tarjetas', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
        renderCardList();
        expect(screen.getByText('No hay tarjetas en esta materia.')).toBeInTheDocument();
    });

    it('debería mostrar el botón de agregar tarjeta cuando no hay tarjetas', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
        renderCardList();
        expect(screen.getByText('Agregar tarjeta')).toBeInTheDocument();
    });

    it('debería mostrar la tabla de tarjetas cuando hay tarjetas', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCards));
        renderCardList();
        expect(screen.getByText('¿Cuál es la capital de Francia?')).toBeInTheDocument();
    });

    it('debería mostrar el botón de nueva tarjeta cuando hay tarjetas', () => {
        mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCards));
        renderCardList();
        expect(screen.getByText('Nueva tarjeta')).toBeInTheDocument();
    });

    it('no debería permitir guardar una card sin opción correcta', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'estudio-cards-subjects') {
                return JSON.stringify(mockSubjects);
            }
            return JSON.stringify([]);
        });

        render(
            <MemoryRouter initialEntries={['/subject/1']}>
                <AppProvider>
                    <Routes>
                        <Route path="/subject/:id" element={<CardList />} />
                    </Routes>
                </AppProvider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Nueva tarjeta'));

        const questionInput = screen.getByLabelText('Pregunta');
        fireEvent.change(questionInput, { target: { value: '¿Cuál es la respuesta correcta?' } });

        const addOptionButton = screen.getByText('Agregar opción');
        fireEvent.click(addOptionButton);
        fireEvent.click(addOptionButton);
        fireEvent.click(addOptionButton);

        const optionInputs = screen.getAllByPlaceholderText(/Opción/);
        fireEvent.change(optionInputs[0], { target: { value: 'respuesta1' } });
        fireEvent.change(optionInputs[1], { target: { value: 'respuesta2' } });
        fireEvent.change(optionInputs[2], { target: { value: 'respuesta3' } });

        fireEvent.click(screen.getByText('Guardar'));

        const errorMessage = screen.getByText('Debes seleccionar una opción correcta para preguntas de respuesta única');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('MuiAlert-message');
        expect(errorMessage.parentElement).toHaveClass('MuiAlert-root');
        expect(errorMessage.parentElement).toHaveClass('MuiAlert-standardError');

        const saveButton = screen.getByText('Guardar');
        expect(saveButton).toBeDisabled();

        expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
            'estudio-cards-cards',
            expect.any(String)
        );

        expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
    });
}); 