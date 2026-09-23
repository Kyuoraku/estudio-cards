import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import CardList from './CardList';
import {
    renderWithProviders,
    seedStorage,
    readCards,
    sampleSubjects,
    sampleCards,
    spyOnPropTypeErrors,
} from '../test/utils';

const renderCardList = (subjectId = 's1') =>
    renderWithProviders(<CardList />, { route: `/subject/${subjectId}`, path: '/subject/:id' });

const optionInputs = () => screen.getAllByPlaceholderText(/^Opción \d+$/);
const optionRow = (idx) => optionInputs()[idx].closest('.MuiBox-root');
const toggleCorrect = (idx) => fireEvent.click(within(optionRow(idx)).getAllByRole('button')[0]);
const deleteOption = (idx) => fireEvent.click(within(optionRow(idx)).getAllByRole('button')[1]);
const isMarkedCorrect = (idx) =>
    within(optionRow(idx)).getAllByRole('button')[0].getAttribute('title') === 'Opción marcada como correcta';

const selectType = (label) => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: label }));
};

const fillForm = ({ question, options = [] }) => {
    if (question !== undefined) {
        fireEvent.change(screen.getByLabelText(/Pregunta/), { target: { value: question } });
    }
    options.forEach(() => fireEvent.click(screen.getByRole('button', { name: 'Agregar opción' })));
    options.forEach((title, idx) => {
        fireEvent.change(optionInputs()[idx], { target: { value: title } });
    });
};

// Envía el formulario sin pasar por la validación nativa `required` del navegador,
// para ejercitar la validación propia del componente.
const submitForm = () => fireEvent.submit(screen.getByLabelText(/Pregunta/).closest('form'));

const openNewCardForm = () => fireEvent.click(screen.getByRole('button', { name: 'Nueva tarjeta' }));

// Specs: specs/05-tarjetas.md
describe('CardList', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    // Debe ser el primer test del archivo: React muestra cada warning de PropTypes una sola vez.
    it('[QUIZ-11] no monta un QuizModal propio ni genera warnings de PropTypes', () => {
        const propTypeErrors = spyOnPropTypeErrors();
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        renderCardList();

        expect(screen.getByRole('table', { name: 'tabla de tarjetas' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(propTypeErrors()).toEqual([]);
    });

    describe('listado', () => {
        it('[CARD-01] sin tarjetas muestra un mensaje y el botón "Agregar tarjeta"', () => {
            seedStorage({ subjects: sampleSubjects, cards: [] });
            renderCardList();
            expect(screen.getByText('No hay tarjetas en esta materia.')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Agregar tarjeta' })).toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('[CARD-01] una materia cuyas tarjetas son de otra materia se considera vacía', () => {
            seedStorage({ subjects: sampleSubjects, cards: [sampleCards[2]] });
            renderCardList('s1');
            expect(screen.getByText('No hay tarjetas en esta materia.')).toBeInTheDocument();
        });

        it('[CARD-02] con tarjetas muestra una tabla con pregunta, tipo y cantidad de opciones', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderCardList('s1');

            const table = screen.getByRole('table', { name: 'tabla de tarjetas' });
            const headers = within(table).getAllByRole('columnheader').map(h => h.textContent);
            expect(headers).toEqual(['Pregunta', 'Tipo', 'Opciones', 'Acciones']);

            const rows = within(table).getAllByRole('row').slice(1);
            expect(rows).toHaveLength(2);
            expect(within(rows[0]).getAllByRole('cell').map(c => c.textContent).slice(0, 2)).toEqual([
                'Respuesta única',
                '3',
            ]);
            expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent(sampleCards[0].question);
            expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent(sampleCards[1].question);
            expect(within(rows[1]).getByText('Respuesta múltiple')).toBeInTheDocument();
            expect(screen.queryByText(sampleCards[2].question)).not.toBeInTheDocument();
        });

        it('[CARD-02] muestra los botones "← Volver" y "Nueva tarjeta"', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderCardList();
            expect(screen.getByRole('button', { name: '← Volver' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Nueva tarjeta' })).toBeInTheDocument();
        });

        it('[CARD-03] "← Volver" navega al inicio', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderCardList();
            fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
            expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
        });
    });

    describe('crear tarjeta', () => {
        beforeEach(() => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        });

        it('[CARD-04] "Nueva tarjeta" abre el formulario vacío con tipo "Respuesta única"', () => {
            renderCardList();
            openNewCardForm();

            expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
            expect(screen.getByLabelText(/Pregunta/)).toHaveValue('');
            expect(screen.getByRole('combobox')).toHaveTextContent('Respuesta única');
            expect(screen.queryAllByPlaceholderText(/^Opción \d+$/)).toHaveLength(0);
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        it('[CARD-04] desde el estado vacío, "Agregar tarjeta" abre el mismo formulario', () => {
            seedStorage({ subjects: sampleSubjects, cards: [] });
            renderCardList();
            fireEvent.click(screen.getByRole('button', { name: 'Agregar tarjeta' }));
            expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
            expect(screen.getByLabelText(/Pregunta/)).toBeInTheDocument();
        });

        it('[CARD-05] "Agregar opción" agrega campos numerados y el botón borrar los quita', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ options: ['A', 'B', 'C'] });

            expect(optionInputs().map(i => i.getAttribute('placeholder'))).toEqual(['Opción 1', 'Opción 2', 'Opción 3']);

            deleteOption(1);
            expect(optionInputs().map(i => i.value)).toEqual(['A', 'C']);
            expect(optionInputs().map(i => i.getAttribute('placeholder'))).toEqual(['Opción 1', 'Opción 2']);
        });

        it('[CARD-06] en "Respuesta única" marcar una opción desmarca las demás', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ options: ['A', 'B', 'C'] });

            toggleCorrect(0);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([true, false, false]);
            toggleCorrect(2);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([false, false, true]);
            toggleCorrect(2);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([false, false, true]);
        });

        it('[CARD-07] en "Respuesta múltiple" cada opción se marca/desmarca de forma independiente', () => {
            renderCardList();
            openNewCardForm();
            selectType('Respuesta múltiple');
            fillForm({ options: ['A', 'B', 'C'] });

            toggleCorrect(0);
            toggleCorrect(2);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([true, false, true]);
            toggleCorrect(0);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([false, false, true]);
        });

        it('[CARD-08] pasar de múltiple a única con varias correctas conserva solo la primera', () => {
            renderCardList();
            openNewCardForm();
            selectType('Respuesta múltiple');
            fillForm({ options: ['A', 'B', 'C'] });
            toggleCorrect(1);
            toggleCorrect(2);

            selectType('Respuesta única');
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([false, true, false]);
        });

        it('[CARD-09] guarda una tarjeta de respuesta única válida y cierra el modal', async () => {
            vi.spyOn(Date, 'now').mockReturnValue(4242);
            renderCardList();
            openNewCardForm();
            fillForm({ question: '  ¿Capital de Francia?  ', options: [' París ', 'Londres'] });
            toggleCorrect(0);

            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

            const saved = readCards().at(-1);
            expect(saved).toEqual({
                id: '4242',
                subject_id: 's1',
                question: '¿Capital de Francia?',
                type: 'single',
                options: [
                    { title: 'París', isCorrect: true },
                    { title: 'Londres', isCorrect: false },
                ],
            });
            await waitFor(() => expect(screen.queryByText('Agregar nueva tarjeta')).not.toBeInTheDocument());
            expect(screen.getByText('¿Capital de Francia?')).toBeInTheDocument();
        });

        it('[CARD-09] guarda una tarjeta de respuesta múltiple con varias correctas', () => {
            renderCardList();
            openNewCardForm();
            selectType('Respuesta múltiple');
            fillForm({ question: 'Primos', options: ['2', '3', '4'] });
            toggleCorrect(0);
            toggleCorrect(1);

            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

            const saved = readCards().at(-1);
            expect(saved.type).toBe('multiple');
            expect(saved.options.map(o => o.isCorrect)).toEqual([true, true, false]);
        });

        it('[CARD-10] "Respuesta múltiple" permite guardar sin opciones correctas', () => {
            renderCardList();
            openNewCardForm();
            selectType('Respuesta múltiple');
            fillForm({ question: 'Ninguna es correcta', options: ['A', 'B'] });

            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

            expect(readCards().at(-1).options.every(o => !o.isCorrect)).toBe(true);
        });

        it('[CARD-11] rechaza una pregunta vacía o en blanco', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: '   ', options: ['A'] });
            toggleCorrect(0);

            submitForm();

            expect(screen.getByRole('alert')).toHaveTextContent('La pregunta no puede estar vacía');
            expect(readCards()).toEqual(sampleCards);
            expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
        });

        it('[CARD-11] rechaza una tarjeta sin opciones', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q' });

            submitForm();

            expect(screen.getByRole('alert')).toHaveTextContent('Debes agregar al menos una opción');
            expect(readCards()).toEqual(sampleCards);
        });

        it('[CARD-11] rechaza opciones vacías o en blanco', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A', '  '] });
            toggleCorrect(0);

            submitForm();

            expect(screen.getByRole('alert')).toHaveTextContent('Todas las opciones deben tener texto');
            expect(readCards()).toEqual(sampleCards);
        });

        it('[CARD-11] rechaza "Respuesta única" sin opción correcta', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: '¿Cuál es la respuesta correcta?', options: ['r1', 'r2', 'r3'] });

            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

            const alert = screen.getByRole('alert');
            expect(alert).toHaveTextContent('Debes seleccionar una opción correcta para preguntas de respuesta única');
            expect(alert).toHaveClass('MuiAlert-standardError');
            expect(readCards()).toEqual(sampleCards);
            expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
        });

        it('[CARD-12] el mensaje de error desaparece al editar un campo', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A'] });
            submitForm();
            expect(screen.getByRole('alert')).toBeInTheDocument();

            fireEvent.change(optionInputs()[0], { target: { value: 'AA' } });
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('[CARD-12] el mensaje de error desaparece al marcar una opción correcta', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A'] });
            submitForm();
            expect(screen.getByRole('alert')).toBeInTheDocument();

            toggleCorrect(0);
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('[CARD-12] el mensaje de error desaparece al borrar una opción', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A', ' '] });
            submitForm();
            expect(screen.getByRole('alert')).toBeInTheDocument();

            deleteOption(1);
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('[CARD-12] el mensaje de error desaparece al cambiar el tipo', () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A'] });
            submitForm();
            expect(screen.getByRole('alert')).toBeInTheDocument();

            selectType('Respuesta múltiple');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('[CARD-13] Cancelar cierra el formulario sin guardar', async () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q', options: ['A'] });
            toggleCorrect(0);

            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

            await waitFor(() => expect(screen.queryByText('Agregar nueva tarjeta')).not.toBeInTheDocument());
            expect(readCards()).toEqual(sampleCards);
        });

        it('[CARD-13] cerrar con la X descarta los cambios', async () => {
            renderCardList();
            openNewCardForm();
            fillForm({ question: 'Q' });

            fireEvent.click(screen.getByLabelText('close'));

            await waitFor(() => expect(screen.queryByText('Agregar nueva tarjeta')).not.toBeInTheDocument());
            expect(readCards()).toEqual(sampleCards);
        });
    });

    describe('editar tarjeta', () => {
        beforeEach(() => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        });

        it('[CARD-14] el botón editar abre el formulario precargado', () => {
            renderCardList();
            fireEvent.click(screen.getAllByRole('button', { name: 'edit' })[1]);

            expect(screen.getByText('Editar tarjeta')).toBeInTheDocument();
            expect(screen.getByLabelText(/Pregunta/)).toHaveValue(sampleCards[1].question);
            expect(screen.getByRole('combobox')).toHaveTextContent('Respuesta múltiple');
            expect(optionInputs().map(i => i.value)).toEqual(['San Martín', 'Belgrano', 'Bolívar']);
            expect([0, 1, 2].map(isMarkedCorrect)).toEqual([true, true, false]);
            expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
        });

        it('[CARD-14] hacer clic en la fila también abre la edición', () => {
            renderCardList();
            fireEvent.click(screen.getByText(sampleCards[0].question));
            expect(screen.getByText('Editar tarjeta')).toBeInTheDocument();
            expect(screen.getByLabelText(/Pregunta/)).toHaveValue(sampleCards[0].question);
        });

        it('[CARD-15] guardar cambios actualiza la tarjeta conservando su id', async () => {
            renderCardList();
            fireEvent.click(screen.getAllByRole('button', { name: 'edit' })[0]);

            fireEvent.change(screen.getByLabelText(/Pregunta/), { target: { value: 'Pregunta editada' } });
            fireEvent.click(screen.getByRole('button', { name: 'Agregar opción' }));
            fireEvent.change(optionInputs()[3], { target: { value: '1820' } });
            toggleCorrect(1);
            fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            const cards = readCards();
            expect(cards).toHaveLength(3);
            expect(cards[0]).toEqual({
                id: 'c1',
                subject_id: 's1',
                question: 'Pregunta editada',
                type: 'single',
                options: [
                    { title: '1810', isCorrect: false },
                    { title: '1816', isCorrect: true },
                    { title: '1853', isCorrect: false },
                    { title: '1820', isCorrect: false },
                ],
            });
            await waitFor(() => expect(screen.queryByText('Editar tarjeta')).not.toBeInTheDocument());
            expect(screen.getByText('Pregunta editada')).toBeInTheDocument();
        });

        it('[CARD-15] la edición aplica las mismas validaciones', () => {
            renderCardList();
            fireEvent.click(screen.getAllByRole('button', { name: 'edit' })[0]);
            deleteOption(0);

            fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            expect(screen.getByRole('alert')).toHaveTextContent(
                'Debes seleccionar una opción correcta para preguntas de respuesta única'
            );
            expect(readCards()).toEqual(sampleCards);
        });

        it('[CARD-15] tras editar, "Nueva tarjeta" vuelve a abrir un formulario vacío', async () => {
            renderCardList();
            fireEvent.click(screen.getAllByRole('button', { name: 'edit' })[0]);
            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

            openNewCardForm();
            expect(screen.getByText('Agregar nueva tarjeta')).toBeInTheDocument();
            expect(screen.getByLabelText(/Pregunta/)).toHaveValue('');
        });
    });

    describe('eliminar tarjeta', () => {
        beforeEach(() => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
        });

        it('[CARD-16] pide confirmación y elimina la tarjeta si se acepta', () => {
            const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
            renderCardList();

            fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);

            expect(confirm).toHaveBeenCalledWith('¿Estás seguro que deseas eliminar esta tarjeta?');
            expect(readCards().map(c => c.id)).toEqual(['c2', 'c3']);
            expect(screen.queryByText(sampleCards[0].question)).not.toBeInTheDocument();
            expect(screen.queryByText('Editar tarjeta')).not.toBeInTheDocument();
        });

        it('[CARD-16] no elimina si se cancela la confirmación', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            renderCardList();

            fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);

            expect(readCards()).toEqual(sampleCards);
            expect(screen.getByText(sampleCards[0].question)).toBeInTheDocument();
        });

        it('[CARD-16] al eliminar la última tarjeta se muestra el estado vacío', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            seedStorage({ subjects: sampleSubjects, cards: [sampleCards[2]] });
            renderCardList('s2');

            fireEvent.click(screen.getByRole('button', { name: 'delete' }));

            expect(screen.getByText('No hay tarjetas en esta materia.')).toBeInTheDocument();
        });
    });
});
