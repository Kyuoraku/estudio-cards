import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { AppProvider } from './AppContext';
import { useApp } from '../hooks/useApp';
import {
    seedStorage,
    readSubjects,
    readCards,
    sampleSubjects,
    sampleCards,
    mockSequentialIds,
} from '../test/utils';

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
const renderApp = () => renderHook(() => useApp(), { wrapper });

// Specs: specs/02-estado-global.md
describe('AppProvider / useApp', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('[CTX-01] useApp lanza un error si se usa fuera de AppProvider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useApp())).toThrow(
            'useApp debe ser usado dentro de un AppProvider'
        );
    });

    it('[CTX-02] carga materias y tarjetas desde localStorage al montar', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        const { result } = renderApp();

        expect(result.current.subjects).toEqual(sampleSubjects);
        expect(result.current.cards).toEqual(sampleCards);
    });

    it('[CTX-02] con almacenamiento vacío expone listas vacías', () => {
        const { result } = renderApp();

        expect(result.current.subjects).toEqual([]);
        expect(result.current.cards).toEqual([]);
    });

    it('[CTX-02] renderiza a sus hijos una vez cargados los datos', () => {
        render(
            <AppProvider>
                <p>contenido</p>
            </AppProvider>
        );
        expect(screen.getByText('contenido')).toBeInTheDocument();
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    it('[CTX-03] addSubject persiste la materia, actualiza el estado y la devuelve', () => {
        mockSequentialIds(42);
        const { result } = renderApp();

        let created;
        act(() => {
            created = result.current.addSubject({ name: 'Química' });
        });

        expect(created).toEqual({ id: '42', name: 'Química' });
        expect(result.current.subjects).toEqual([created]);
        expect(readSubjects()).toEqual([created]);
    });

    it('[CTX-04] updateSubject actualiza la materia en estado y almacenamiento', () => {
        seedStorage({ subjects: sampleSubjects });
        const { result } = renderApp();

        act(() => {
            result.current.updateSubject('s2', { name: 'Biología Celular' });
        });

        expect(result.current.subjects[1]).toEqual({ id: 's2', name: 'Biología Celular' });
        expect(result.current.subjects[0]).toEqual(sampleSubjects[0]);
        expect(readSubjects()[1].name).toBe('Biología Celular');
    });

    it('[CTX-05] deleteSubject elimina la materia del estado y sus tarjetas del almacenamiento', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        const { result } = renderApp();

        act(() => {
            result.current.deleteSubject('s1');
        });

        expect(result.current.subjects).toEqual([sampleSubjects[1]]);
        expect(readSubjects()).toEqual([sampleSubjects[1]]);
        expect(readCards()).toEqual([sampleCards[2]]);
    });

    it('[CTX-06] addCard persiste la tarjeta, la agrega al estado y la devuelve', () => {
        mockSequentialIds(7);
        seedStorage({ cards: [sampleCards[0]] });
        const { result } = renderApp();
        const data = { subject_id: 's1', question: 'Q', type: 'single', options: [{ title: 'A', isCorrect: true }] };

        let created;
        act(() => {
            created = result.current.addCard(data);
        });

        expect(created).toEqual({ id: '7', ...data });
        expect(result.current.cards).toEqual([sampleCards[0], created]);
        expect(readCards()).toEqual([sampleCards[0], created]);
    });

    it('[CTX-07] updateCard actualiza la tarjeta en estado y almacenamiento', () => {
        seedStorage({ cards: sampleCards });
        const { result } = renderApp();

        act(() => {
            result.current.updateCard('c1', { question: 'Editada' });
        });

        expect(result.current.cards[0]).toEqual({ ...sampleCards[0], question: 'Editada' });
        expect(result.current.cards.slice(1)).toEqual(sampleCards.slice(1));
        expect(readCards()[0].question).toBe('Editada');
    });

    it('[CTX-08] deleteCard elimina la tarjeta del estado y del almacenamiento', () => {
        seedStorage({ cards: sampleCards });
        const { result } = renderApp();

        act(() => {
            result.current.deleteCard('c2');
        });

        expect(result.current.cards.map(c => c.id)).toEqual(['c1', 'c3']);
        expect(readCards().map(c => c.id)).toEqual(['c1', 'c3']);
    });

    it('[CTX-09] getSubjectCards devuelve solo las tarjetas de la materia indicada', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        const { result } = renderApp();

        expect(result.current.getSubjectCards('s1').map(c => c.id)).toEqual(['c1', 'c2']);
        expect(result.current.getSubjectCards('s2').map(c => c.id)).toEqual(['c3']);
        expect(result.current.getSubjectCards('nope')).toEqual([]);
    });

    it('[CTX-09] getSubjectCards refleja tarjetas agregadas después del montaje', () => {
        mockSequentialIds();
        const { result } = renderApp();

        act(() => {
            result.current.addCard({ subject_id: 's1', question: 'Q1', type: 'single', options: [] });
        });
        act(() => {
            result.current.addCard({ subject_id: 's1', question: 'Q2', type: 'single', options: [] });
        });

        expect(result.current.getSubjectCards('s1').map(c => c.question)).toEqual(['Q1', 'Q2']);
    });

    // BUG-05: el estado `cards` no se purga al borrar una materia (solo localStorage).
    it.fails('[BUG-05] deleteSubject debería quitar del estado las tarjetas de la materia', () => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        const { result } = renderApp();

        act(() => {
            result.current.deleteSubject('s1');
        });

        expect(result.current.cards).toEqual([sampleCards[2]]);
    });
});
