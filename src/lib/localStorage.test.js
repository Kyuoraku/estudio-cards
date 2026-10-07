import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getCardTypeLabel,
    getSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getCards,
    addCard,
    updateCard,
    deleteCard,
} from './localStorage';
import {
    SUBJECTS_KEY,
    CARDS_KEY,
    seedStorage,
    readSubjects,
    readCards,
    sampleSubjects,
    sampleCards,
} from '../test/utils';

// Specs: specs/01-persistencia.md
describe('lib/localStorage', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('getCardTypeLabel', () => {
        it('[STO-01] traduce los tipos conocidos a su etiqueta en español', () => {
            expect(getCardTypeLabel('single')).toBe('Respuesta única');
            expect(getCardTypeLabel('multiple')).toBe('Respuesta múltiple');
            expect(getCardTypeLabel('fill')).toBe('Completar palabras');
        });

        it('[STO-01] devuelve el valor original para tipos desconocidos', () => {
            expect(getCardTypeLabel('otro')).toBe('otro');
            expect(getCardTypeLabel(undefined)).toBeUndefined();
        });
    });

    describe('materias', () => {
        it('[STO-02] getSubjects devuelve [] cuando no hay nada guardado', () => {
            expect(getSubjects()).toEqual([]);
        });

        it('[STO-02] getSubjects devuelve las materias guardadas bajo la clave estudio-cards-subjects', () => {
            localStorage.setItem(SUBJECTS_KEY, JSON.stringify(sampleSubjects));
            expect(getSubjects()).toEqual(sampleSubjects);
        });

        it('[STO-03] addSubject genera id con Date.now() si está libre, persiste y devuelve la materia', () => {
            vi.spyOn(Date, 'now').mockReturnValue(123456);
            const created = addSubject({ name: 'Química', color: '#00ff00' });

            expect(created).toEqual({ id: '123456', name: 'Química', color: '#00ff00' });
            expect(readSubjects()).toEqual([created]);
        });

        it('[STO-03] addSubject agrega al final sin perder las existentes y descarta campos extra', () => {
            seedStorage({ subjects: sampleSubjects });
            vi.spyOn(Date, 'now').mockReturnValue(1);
            addSubject({ name: 'Física', extra: 'x' });

            const stored = readSubjects();
            expect(stored).toHaveLength(3);
            expect(stored.slice(0, 2)).toEqual(sampleSubjects);
            expect(stored[2]).toEqual({ id: '1', name: 'Física' });
        });

        it('[STO-03] dos materias creadas en el mismo milisegundo tienen ids distintos', () => {
            vi.spyOn(Date, 'now').mockReturnValue(1);
            const a = addSubject({ name: 'A' });
            const b = addSubject({ name: 'B' });

            expect(a.id).toBe('1');
            expect(b.id).toBe('2');
            expect(readSubjects().map(s => s.id)).toEqual(['1', '2']);
        });

        it('[STO-03] tres o más materias creadas en el mismo milisegundo reciben ids consecutivos únicos', () => {
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            const ids = ['A', 'B', 'C', 'D'].map(name => addSubject({ name }).id);

            expect(ids).toEqual(['1000', '1001', '1002', '1003']);
        });

        it('[STO-03] si el id Date.now() ya existe por una alta previa usa el siguiente libre', () => {
            seedStorage({ subjects: [{ id: '500', name: 'Vieja' }, { id: '501', name: 'Otra' }] });
            vi.spyOn(Date, 'now').mockReturnValue(500);
            const created = addSubject({ name: 'Nueva' });

            expect(created.id).toBe('502');
            updateSubject(created.id, { name: 'Editada' });
            deleteSubject('500');
            expect(readSubjects()).toEqual([
                { id: '501', name: 'Otra' },
                { id: '502', name: 'Editada' },
            ]);
        });

        it('[STO-04] updateSubject fusiona los cambios, persiste y devuelve la materia actualizada', () => {
            seedStorage({ subjects: sampleSubjects });
            const updated = updateSubject('s1', { name: 'Historia Argentina' });

            expect(updated).toEqual({ id: 's1', name: 'Historia Argentina', color: '#ff0000' });
            expect(readSubjects()[0]).toEqual(updated);
            expect(readSubjects()[1]).toEqual(sampleSubjects[1]);
        });

        it('[STO-04] updateSubject devuelve null y no escribe si la materia no existe', () => {
            seedStorage({ subjects: sampleSubjects });
            const setItem = vi.spyOn(Storage.prototype, 'setItem');

            expect(updateSubject('nope', { name: 'X' })).toBeNull();
            expect(setItem).not.toHaveBeenCalled();
        });

        it('[STO-05] deleteSubject elimina la materia y en cascada todas sus tarjetas', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            deleteSubject('s1');

            expect(readSubjects()).toEqual([sampleSubjects[1]]);
            expect(readCards()).toEqual([sampleCards[2]]);
        });

        it('[STO-05] deleteSubject con id inexistente no altera los datos', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            deleteSubject('nope');

            expect(readSubjects()).toEqual(sampleSubjects);
            expect(readCards()).toEqual(sampleCards);
        });
    });

    describe('tarjetas', () => {
        it('[STO-06] getCards devuelve [] cuando no hay nada guardado', () => {
            expect(getCards()).toEqual([]);
        });

        it('[STO-06] getCards devuelve las tarjetas guardadas bajo la clave estudio-cards-cards', () => {
            localStorage.setItem(CARDS_KEY, JSON.stringify(sampleCards));
            expect(getCards()).toEqual(sampleCards);
        });

        it('[STO-07] addCard genera id con Date.now() si está libre, conserva todos los campos y persiste', () => {
            seedStorage({ cards: [sampleCards[0]] });
            vi.spyOn(Date, 'now').mockReturnValue(999);
            const { id: _ignored, ...cardData } = sampleCards[1];
            const created = addCard(cardData);

            expect(created).toEqual({ id: '999', ...cardData });
            expect(readCards()).toEqual([sampleCards[0], created]);
        });

        it('[STO-07] dos tarjetas creadas en el mismo milisegundo tienen ids distintos', () => {
            vi.spyOn(Date, 'now').mockReturnValue(1);
            const a = addCard({ subject_id: 's1', question: 'A', type: 'single', options: [] });
            const b = addCard({ subject_id: 's1', question: 'B', type: 'single', options: [] });

            expect(a.id).toBe('1');
            expect(b.id).toBe('2');
            expect(readCards().map(c => c.id)).toEqual(['1', '2']);
        });

        it('[STO-07] tres o más tarjetas creadas en el mismo milisegundo reciben ids consecutivos únicos', () => {
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            const ids = ['A', 'B', 'C', 'D'].map(question =>
                addCard({ subject_id: 's1', question, type: 'single', options: [] }).id
            );

            expect(ids).toEqual(['1000', '1001', '1002', '1003']);
        });

        it('[STO-07] si el id Date.now() ya existe por una alta previa usa el siguiente libre', () => {
            seedStorage({ cards: [{ ...sampleCards[0], id: '500' }, { ...sampleCards[1], id: '501' }] });
            vi.spyOn(Date, 'now').mockReturnValue(500);
            const created = addCard({ subject_id: 's1', question: 'Nueva', type: 'single', options: [] });

            expect(created.id).toBe('502');
            updateCard(created.id, { question: 'Editada' });
            deleteCard('500');
            expect(readCards().map(c => [c.id, c.question])).toEqual([
                ['501', sampleCards[1].question],
                ['502', 'Editada'],
            ]);
        });

        it('[STO-08] updateCard fusiona los cambios, persiste y devuelve la tarjeta actualizada', () => {
            seedStorage({ cards: sampleCards });
            const updated = updateCard('c1', { question: 'Nueva', type: 'multiple' });

            expect(updated).toEqual({ ...sampleCards[0], question: 'Nueva', type: 'multiple' });
            expect(readCards()).toEqual([updated, sampleCards[1], sampleCards[2]]);
        });

        it('[STO-08] updateCard devuelve null y no escribe si la tarjeta no existe', () => {
            seedStorage({ cards: sampleCards });
            const setItem = vi.spyOn(Storage.prototype, 'setItem');

            expect(updateCard('nope', { question: 'X' })).toBeNull();
            expect(setItem).not.toHaveBeenCalled();
        });

        it('[STO-09] deleteCard elimina solo la tarjeta indicada', () => {
            seedStorage({ cards: sampleCards });
            deleteCard('c2');

            expect(readCards()).toEqual([sampleCards[0], sampleCards[2]]);
        });
    });
});
