import { format } from 'node:util';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { AppProvider } from '../context/AppContext';

export const SUBJECTS_KEY = 'estudio-cards-subjects';
export const CARDS_KEY = 'estudio-cards-cards';

export const seedStorage = ({ subjects = [], cards = [] } = {}) => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
};

export const readSubjects = () => JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]');
export const readCards = () => JSON.parse(localStorage.getItem(CARDS_KEY) || '[]');

// Date.now() se usa para generar ids; lo hacemos determinista y siempre creciente.
export const mockSequentialIds = (start = 1000) => {
    let next = start;
    return vi.spyOn(Date, 'now').mockImplementation(() => next++);
};

// Espía console.error y devuelve una función con los warnings de PropTypes registrados.
// React deduplica cada warning por módulo, así que conviene usarlo en el primer test
// del archivo que renderiza el componente.
export const spyOnPropTypeErrors = () => {
    const spy = vi.spyOn(console, 'error');
    return () =>
        spy.mock.calls
            .map(args => format(...args))
            .filter(message => message.includes('Failed prop type'));
};

export const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
};

// Renderiza `ui` dentro de AppProvider + MemoryRouter en `route`, montado en `path`.
export const renderWithProviders = (ui, { route = '/', path = '/' } = {}) =>
    render(
        <MemoryRouter initialEntries={[route]}>
            <AppProvider>
                <Routes>
                    <Route path={path} element={ui} />
                    <Route path="*" element={null} />
                </Routes>
                <LocationDisplay />
            </AppProvider>
        </MemoryRouter>
    );

export const sampleSubjects = [
    { id: 's1', name: 'Historia', color: '#ff0000' },
    { id: 's2', name: 'Biología' },
];

export const sampleCards = [
    {
        id: 'c1',
        subject_id: 's1',
        question: '¿En qué año comenzó la Revolución de Mayo?',
        type: 'single',
        options: [
            { title: '1810', isCorrect: true },
            { title: '1816', isCorrect: false },
            { title: '1853', isCorrect: false },
        ],
    },
    {
        id: 'c2',
        subject_id: 's1',
        question: '¿Cuáles fueron próceres argentinos?',
        type: 'multiple',
        options: [
            { title: 'San Martín', isCorrect: true },
            { title: 'Belgrano', isCorrect: true },
            { title: 'Bolívar', isCorrect: false },
        ],
    },
    {
        id: 'c3',
        subject_id: 's2',
        question: '¿Cuál es la unidad básica de la vida?',
        type: 'single',
        options: [
            { title: 'La célula', isCorrect: true },
            { title: 'El átomo', isCorrect: false },
        ],
    },
];
