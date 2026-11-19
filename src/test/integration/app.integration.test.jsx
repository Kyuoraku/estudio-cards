import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../../App';
import {
    seedStorage,
    readSubjects,
    readCards,
    sampleSubjects,
    sampleCards,
    mockSequentialIds,
} from '../utils';

// Pruebas de integración: la app completa (HashRouter, AppProvider, Header, rutas y modales)
// sobre el localStorage real de jsdom, sin mocks de componentes.

const renderAppAt = (hash = '#/') => {
    window.location.hash = hash;
    return render(<App />);
};

const currentPath = () => window.location.hash.replace(/^#/, '') || '/';

const waitForDialogToClose = () =>
    waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

const optionInputs = () => screen.getAllByPlaceholderText(/^Opción \d+$/);
const markCorrect = (idx) =>
    fireEvent.click(within(optionInputs()[idx].closest('.MuiBox-root')).getAllByRole('button')[0]);

const createSubjectViaUi = async (name) => {
    fireEvent.click(screen.getByRole('button', { name: 'Nueva Materia' }));
    fireEvent.change(screen.getByLabelText('Nombre de la materia'), { target: { value: name } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar materia' }));
    await waitForDialogToClose();
};

const createCardViaUi = async ({ question, options, correct, type }) => {
    const addButton =
        screen.queryByRole('button', { name: 'Nueva tarjeta' }) ??
        screen.getByRole('button', { name: 'Agregar tarjeta' });
    fireEvent.click(addButton);
    fireEvent.change(screen.getByLabelText(/Pregunta/), { target: { value: question } });
    if (type === 'multiple') {
        fireEvent.mouseDown(screen.getByRole('combobox'));
        fireEvent.click(screen.getByRole('option', { name: 'Respuesta múltiple' }));
    }
    options.forEach(() => fireEvent.click(screen.getByRole('button', { name: 'Agregar opción' })));
    options.forEach((title, idx) => fireEvent.change(optionInputs()[idx], { target: { value: title } }));
    correct.forEach(markCorrect);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitForDialogToClose();
};

describe('Integración: App completa', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        // QuizModal declara subjectId como number (BUG-04); evitamos ruido del warning de PropTypes.
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('navegación y rutas', () => {
        it('[NAV-01] "/" muestra la grilla de materias', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/');

            expect(screen.getByText('Estudio Cards')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Biología' })).toBeInTheDocument();
        });

        it('[NAV-01] "/subject/:id" muestra las tarjetas de la materia y su nombre en el header', () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s1');

            expect(screen.getByRole('table', { name: 'tabla de tarjetas' })).toBeInTheDocument();
            expect(screen.getByText(sampleCards[0].question)).toBeInTheDocument();
            expect(screen.getByLabelText('iniciar quiz')).toBeInTheDocument();
            expect(screen.getByText('Historia')).toBeInTheDocument();
        });

        it('[NAV-01] "/quiz/:id" muestra la página de quiz con la materia en el header', () => {
            seedStorage({ subjects: sampleSubjects, cards: [] });
            renderAppAt('#/quiz/s2');

            expect(screen.getByText('No hay tarjetas para hacer el quiz.')).toBeInTheDocument();
            expect(screen.getByText('Biología')).toBeInTheDocument();
            expect(screen.getByLabelText('eliminar materia')).toBeInTheDocument();
        });

        it('[NAV-02] una ruta desconocida redirige a "/"', async () => {
            seedStorage({ subjects: sampleSubjects });
            renderAppAt('#/no/existe');

            await waitFor(() => expect(currentPath()).toBe('/'));
            expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
        });

        it('[NAV-05] navegar: inicio → materia → volver → título', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/');

            fireEvent.click(screen.getByRole('heading', { name: 'Historia' }));
            await waitFor(() => expect(currentPath()).toBe('/subject/s1'));
            expect(screen.getByText(sampleCards[0].question)).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
            await waitFor(() => expect(currentPath()).toBe('/'));
            expect(screen.getByRole('button', { name: 'Nueva Materia' })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('heading', { name: 'Biología' }));
            await waitFor(() => expect(currentPath()).toBe('/subject/s2'));
            fireEvent.click(screen.getByText('Estudio Cards'));
            await waitFor(() => expect(currentPath()).toBe('/'));
        });

        it('[QUIZ-10] el botón "Quiz" de una materia abre /quiz/:id con una pregunta para responder', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/');

            const card = screen.getByRole('heading', { name: 'Biología' }).closest('.MuiCard-root');
            fireEvent.click(within(card).getByRole('button', { name: 'Quiz' }));

            await waitFor(() => expect(currentPath()).toBe('/quiz/s2'));
            expect(screen.getByRole('button', { name: '← Volver' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '¿Cuál es la unidad básica de la vida?' })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'La célula' }));
            expect(screen.getByRole('button', { name: 'La célula' })).toBeDisabled();
            fireEvent.click(screen.getByRole('button', { name: 'Siguiente pregunta' }));
            expect(screen.getByRole('button', { name: 'La célula' })).toBeEnabled();
        });
    });

    describe('flujo de materias', () => {
        it('[SUBJ-01][SUBJ-04] crear materias desde el header las muestra en la grilla y las persiste', async () => {
            mockSequentialIds();
            renderAppAt('#/');
            expect(screen.getByText('No hay materias agregadas aún.')).toBeInTheDocument();

            await createSubjectViaUi('Matemática');
            await createSubjectViaUi('Lengua');

            expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual([
                'Matemática',
                'Lengua',
            ]);
            expect(readSubjects().map(s => s.name)).toEqual(['Matemática', 'Lengua']);
            expect(new Set(readSubjects().map(s => s.id)).size).toBe(2);
        });

        it('[SUBJ-01] el modal "Agregar nueva materia" se abre con el título correcto', () => {
            renderAppAt('#/');
            fireEvent.click(screen.getByRole('button', { name: 'Nueva Materia' }));
            expect(within(screen.getByRole('dialog')).getByText('Agregar nueva materia')).toBeInTheDocument();
        });

        it('[SUBJ-02][SUBJ-03] nombre vacío no cierra el modal; Cancelar cierra sin crear', async () => {
            renderAppAt('#/');
            fireEvent.click(screen.getByRole('button', { name: 'Nueva Materia' }));

            fireEvent.click(screen.getByRole('button', { name: 'Agregar materia' }));
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
            await waitForDialogToClose();
            expect(readSubjects()).toEqual([]);
            expect(screen.getByText('No hay materias agregadas aún.')).toBeInTheDocument();
        });

        it('[SUBJ-06] eliminar una materia desde la grilla la quita junto con sus tarjetas', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/');

            const card = screen.getByRole('heading', { name: 'Historia' }).closest('.MuiCard-root');
            fireEvent.click(within(card).getByRole('button', { name: 'eliminar materia' }));
            fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

            await waitForDialogToClose();
            expect(screen.queryByRole('heading', { name: 'Historia' })).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Biología' })).toBeInTheDocument();
            expect(readCards().map(c => c.id)).toEqual(['c3']);
        });

        it('[SUBJ-07] eliminar la materia abierta desde el header vuelve al inicio', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s1');

            fireEvent.click(screen.getByLabelText('eliminar materia'));
            fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

            await waitFor(() => expect(currentPath()).toBe('/'));
            await waitForDialogToClose();
            expect(screen.queryByRole('heading', { name: 'Historia' })).not.toBeInTheDocument();
            expect(readSubjects()).toEqual([sampleSubjects[1]]);
            expect(readCards().map(c => c.id)).toEqual(['c3']);
        });
    });

    describe('flujo de tarjetas', () => {
        it('[CARD-04][CARD-09][CARD-14][CARD-15][CARD-16] crear, editar y eliminar tarjetas dentro de una materia', async () => {
            mockSequentialIds();
            seedStorage({ subjects: sampleSubjects, cards: [] });
            renderAppAt('#/subject/s2');
            expect(screen.getByText('No hay tarjetas en esta materia.')).toBeInTheDocument();

            await createCardViaUi({ question: '¿Qué es el ADN?', options: ['Un ácido', 'Una proteína'], correct: [0] });
            await createCardViaUi({
                question: '¿Qué organelas tienen ADN?',
                options: ['Núcleo', 'Mitocondria', 'Ribosoma'],
                correct: [0, 1],
                type: 'multiple',
            });

            const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
            expect(rows.map(r => within(r).getByRole('rowheader').textContent)).toEqual([
                '¿Qué es el ADN?',
                '¿Qué organelas tienen ADN?',
            ]);
            expect(within(rows[1]).getByText('Respuesta múltiple')).toBeInTheDocument();
            expect(readCards()).toHaveLength(2);
            expect(readCards().every(c => c.subject_id === 's2')).toBe(true);
            expect(new Set(readCards().map(c => c.id)).size).toBe(2);

            fireEvent.click(screen.getByText('¿Qué es el ADN?'));
            fireEvent.change(screen.getByLabelText(/Pregunta/), { target: { value: '¿Qué significa ADN?' } });
            fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
            await waitForDialogToClose();
            expect(screen.getByText('¿Qué significa ADN?')).toBeInTheDocument();
            expect(readCards()[0].question).toBe('¿Qué significa ADN?');

            vi.spyOn(window, 'confirm').mockReturnValue(true);
            fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);
            expect(screen.queryByText('¿Qué significa ADN?')).not.toBeInTheDocument();
            expect(readCards().map(c => c.question)).toEqual(['¿Qué organelas tienen ADN?']);
        });

        it('[CARD-01] las tarjetas de una materia no aparecen en otra', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s2');

            expect(screen.getByText(sampleCards[2].question)).toBeInTheDocument();
            expect(screen.queryByText(sampleCards[0].question)).not.toBeInTheDocument();
        });
    });

    describe('flujo de quiz (modal desde el header)', () => {
        it('[QUIZ-01][QUIZ-02][QUIZ-04][QUIZ-07][QUIZ-08] responder todas las tarjetas de la materia y cerrar al terminar', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s1');

            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            const dialog = await screen.findByRole('dialog');
            const q = within(dialog);
            expect(q.getByRole('heading', { name: sampleCards[0].question })).toBeInTheDocument();

            fireEvent.click(q.getByText('1810'));
            fireEvent.click(q.getByRole('button', { name: 'Enviar' }));
            expect(q.getByRole('button', { name: 'Siguiente' })).toHaveClass('MuiButton-containedSuccess');
            fireEvent.click(q.getByRole('button', { name: 'Siguiente' }));

            expect(q.getByRole('heading', { name: sampleCards[1].question })).toBeInTheDocument();
            fireEvent.click(q.getByText('San Martín'));
            fireEvent.click(q.getByRole('button', { name: 'Enviar' }));
            expect(q.getByRole('button', { name: 'Siguiente' })).toHaveClass('MuiButton-containedError');
            fireEvent.click(q.getByRole('button', { name: 'Siguiente' }));

            await waitForDialogToClose();
            expect(currentPath()).toBe('/subject/s1');
        });

        it('[QUIZ-09] el quiz puede cerrarse antes de terminar', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s2');

            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            const dialog = await screen.findByRole('dialog');
            expect(within(dialog).getByRole('heading', { name: sampleCards[2].question })).toBeInTheDocument();

            fireEvent.click(within(dialog).getByTestId('CloseIcon').closest('button'));
            await waitForDialogToClose();
        });

        it('[QUIZ-02] el quiz usa solo tarjetas de la materia seleccionada', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            renderAppAt('#/subject/s2');

            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            const dialog = await screen.findByRole('dialog');
            fireEvent.click(within(dialog).getByText('La célula'));
            fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
            fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }));

            await waitForDialogToClose();
        });

        // BUG-02: el modal lee localStorage solo cuando cambia subjectId; si ya se abrió para esa
        // materia, no ve tarjetas creadas después.
        it.fails('[BUG-02] una tarjeta creada tras abrir el quiz debería aparecer al reabrirlo', async () => {
            mockSequentialIds();
            seedStorage({ subjects: sampleSubjects, cards: [sampleCards[2]] });
            renderAppAt('#/subject/s2');

            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            let dialog = await screen.findByRole('dialog');
            fireEvent.click(within(dialog).getByTestId('CloseIcon').closest('button'));
            await waitForDialogToClose();

            await createCardViaUi({ question: 'Nueva pregunta', options: ['Sí', 'No'], correct: [0] });
            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            dialog = await screen.findByRole('dialog');
            fireEvent.click(within(dialog).getByText('La célula'));
            fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
            fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }));

            expect(within(dialog).getByRole('heading', { name: 'Nueva pregunta' })).toBeInTheDocument();
        });
    });

    describe('persistencia e importación/exportación', () => {
        let originalLocation;

        afterEach(() => {
            if (originalLocation) Object.defineProperty(window, 'location', originalLocation);
            originalLocation = undefined;
        });

        it('[STO-10] los datos creados sobreviven a una recarga de la app', async () => {
            mockSequentialIds();
            const { unmount } = renderAppAt('#/');
            await createSubjectViaUi('Geografía');
            const [subject] = readSubjects();

            fireEvent.click(screen.getByRole('heading', { name: 'Geografía' }));
            await waitFor(() => expect(currentPath()).toBe(`/subject/${subject.id}`));
            await createCardViaUi({ question: '¿Capital de Chile?', options: ['Santiago', 'Lima'], correct: [0] });
            unmount();

            renderAppAt(`#/subject/${subject.id}`);
            expect(screen.getByText('Geografía')).toBeInTheDocument();
            expect(screen.getByText('¿Capital de Chile?')).toBeInTheDocument();
        });

        it('[IO-01][IO-02] un backup exportado puede importarse y restaura los datos', async () => {
            seedStorage({ subjects: sampleSubjects, cards: sampleCards });
            let exported;
            URL.createObjectURL = vi.fn((blob) => {
                exported = blob;
                return 'blob:mock';
            });
            URL.revokeObjectURL = vi.fn();
            vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

            const { unmount } = renderAppAt('#/');
            fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));
            expect(exported).toBeDefined();
            unmount();
            delete URL.createObjectURL;
            delete URL.revokeObjectURL;

            // Se borra todo y se importa el backup.
            localStorage.clear();
            const hashBefore = window.location.hash;
            originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
            const reload = vi.fn();
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...window.location, reload },
            });

            window.location.hash = hashBefore;
            const second = render(<App />);
            expect(screen.getByText('No hay materias agregadas aún.')).toBeInTheDocument();
            const file = new File([exported], 'estudio-cards-backup.json', { type: 'application/json' });
            fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
            await waitFor(() => expect(reload).toHaveBeenCalled());
            second.unmount();
            Object.defineProperty(window, 'location', originalLocation);
            originalLocation = undefined;

            // "Recarga": la app vuelve a leer localStorage.
            renderAppAt('#/');
            expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Biología' })).toBeInTheDocument();
            expect(readCards()).toEqual(sampleCards);
        });
    });
});
