import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';
import {
    renderWithProviders,
    seedStorage,
    readSubjects,
    readCards,
    sampleSubjects,
    sampleCards,
    SUBJECTS_KEY,
    CARDS_KEY,
} from '../test/utils';

const renderHeader = ({ subjectId, route = '/' } = {}) => {
    const onManageSubjects = vi.fn();
    const onStartQuiz = vi.fn();
    renderWithProviders(
        <Header onManageSubjects={onManageSubjects} onStartQuiz={onStartQuiz} subjectId={subjectId} />,
        { route, path: '*' }
    );
    return { onManageSubjects, onStartQuiz };
};

const readBlob = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
    });

// Specs: specs/03-navegacion-layout.md, specs/04-materias.md, specs/06-quiz.md, specs/07-importar-exportar.md
describe('Header', () => {
    beforeEach(() => {
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
    });

    describe('en la pantalla principal (sin materia seleccionada)', () => {
        it('[NAV-03] muestra el título y las acciones globales', () => {
            renderHeader();
            expect(screen.getByText('Estudio Cards')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Nueva Materia' })).toBeInTheDocument();
            expect(screen.getByText('Importar')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
            expect(screen.queryByLabelText('iniciar quiz')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('eliminar materia')).not.toBeInTheDocument();
        });

        it('[NAV-03] el título navega al inicio', () => {
            renderHeader({ route: '/subject/s1' });
            fireEvent.click(screen.getByText('Estudio Cards'));
            expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
        });

        it('[SUBJ-01] "Nueva Materia" invoca onManageSubjects', () => {
            const { onManageSubjects } = renderHeader();
            fireEvent.click(screen.getByRole('button', { name: 'Nueva Materia' }));
            expect(onManageSubjects).toHaveBeenCalledTimes(1);
        });

        it('[NAV-03] un subjectId inexistente se trata como "sin materia"', () => {
            renderHeader({ subjectId: 'nope' });
            expect(screen.getByRole('button', { name: 'Nueva Materia' })).toBeInTheDocument();
            expect(screen.queryByLabelText('iniciar quiz')).not.toBeInTheDocument();
        });
    });

    describe('con una materia seleccionada', () => {
        it('[NAV-04] muestra el nombre de la materia, el botón de quiz y el de eliminar; oculta las acciones globales', () => {
            renderHeader({ subjectId: 's1', route: '/subject/s1' });
            expect(screen.getByText('Historia')).toBeInTheDocument();
            expect(screen.getByLabelText('iniciar quiz')).toBeInTheDocument();
            expect(screen.getByLabelText('eliminar materia')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Nueva Materia' })).not.toBeInTheDocument();
            expect(screen.queryByText('Importar')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Exportar' })).not.toBeInTheDocument();
        });

        it('[QUIZ-01] el botón de quiz invoca onStartQuiz con el id de la materia', () => {
            const { onStartQuiz } = renderHeader({ subjectId: 's1', route: '/subject/s1' });
            fireEvent.click(screen.getByLabelText('iniciar quiz'));
            expect(onStartQuiz).toHaveBeenCalledWith('s1');
        });

        it('[SUBJ-07] eliminar pide confirmación y Cancelar no borra nada', async () => {
            renderHeader({ subjectId: 's1', route: '/subject/s1' });
            fireEvent.click(screen.getByLabelText('eliminar materia'));

            expect(
                screen.getByText('¿Estás seguro que deseas eliminar la materia "Historia"? Esta acción no se puede deshacer.')
            ).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(readSubjects()).toEqual(sampleSubjects);
            expect(screen.getByTestId('location')).toHaveTextContent('/subject/s1');
        });

        it('[SUBJ-07] confirmar elimina la materia (y sus tarjetas) y vuelve al inicio', () => {
            renderHeader({ subjectId: 's1', route: '/subject/s1' });
            fireEvent.click(screen.getByLabelText('eliminar materia'));
            fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

            expect(readSubjects()).toEqual([sampleSubjects[1]]);
            expect(readCards().map(c => c.id)).toEqual(['c3']);
            expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
        });
    });

    describe('exportar', () => {
        let createObjectURL;
        let revokeObjectURL;

        beforeEach(() => {
            createObjectURL = vi.fn(() => 'blob:mock');
            revokeObjectURL = vi.fn();
            URL.createObjectURL = createObjectURL;
            URL.revokeObjectURL = revokeObjectURL;
        });

        afterEach(() => {
            delete URL.createObjectURL;
            delete URL.revokeObjectURL;
        });

        it('[IO-01] descarga estudio-cards-backup.json con materias y tarjetas', async () => {
            let clicked;
            vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
                clicked = { href: this.href, download: this.download, attached: document.body.contains(this) };
            });
            renderHeader();

            fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

            expect(clicked).toEqual({ href: 'blob:mock', download: 'estudio-cards-backup.json', attached: true });
            expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
            expect(document.querySelector('a[download]')).toBeNull();

            const blob = createObjectURL.mock.calls[0][0];
            expect(blob.type).toBe('application/json');
            const text = await readBlob(blob);
            expect(JSON.parse(text)).toEqual({ subjects: sampleSubjects, cards: sampleCards });
            expect(text).toBe(JSON.stringify({ subjects: sampleSubjects, cards: sampleCards }, null, 2));
        });

        it('[IO-01] con almacenamiento vacío exporta listas vacías', async () => {
            localStorage.clear();
            vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
            renderHeader();

            fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

            const text = await readBlob(createObjectURL.mock.calls[0][0]);
            expect(JSON.parse(text)).toEqual({ subjects: [], cards: [] });
        });
    });

    describe('importar', () => {
        let originalLocation;
        let reload;

        beforeEach(() => {
            originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
            reload = vi.fn();
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...window.location, reload },
            });
        });

        afterEach(() => {
            Object.defineProperty(window, 'location', originalLocation);
        });

        const importFile = (content) => {
            const input = document.querySelector('input[type="file"]');
            const file = new File([content], 'backup.json', { type: 'application/json' });
            fireEvent.change(input, { target: { files: [file] } });
        };

        it('[IO-02] el selector de archivos acepta solo .json', () => {
            renderHeader();
            const input = document.querySelector('input[type="file"]');
            expect(input).toHaveAttribute('accept', '.json');
        });

        it('[IO-02] un archivo válido reemplaza materias y tarjetas y recarga la página', async () => {
            renderHeader();
            const imported = {
                subjects: [{ id: 'x1', name: 'Importada' }],
                cards: [{ id: 'k1', subject_id: 'x1', question: 'Q', type: 'single', options: [] }],
            };

            importFile(JSON.stringify(imported));

            await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
            expect(JSON.parse(localStorage.getItem(SUBJECTS_KEY))).toEqual(imported.subjects);
            expect(JSON.parse(localStorage.getItem(CARDS_KEY))).toEqual(imported.cards);
        });

        it('[IO-02] acepta listas vacías como archivo válido', async () => {
            renderHeader();
            importFile(JSON.stringify({ subjects: [], cards: [] }));

            await waitFor(() => expect(reload).toHaveBeenCalled());
            expect(readSubjects()).toEqual([]);
            expect(readCards()).toEqual([]);
        });

        it.each([
            ['sin cards', { subjects: [] }],
            ['sin subjects', { cards: [] }],
            ['objeto vacío', {}],
        ])('[IO-03] un JSON %s muestra "formato incorrecto" y no toca los datos', async (_label, data) => {
            const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
            renderHeader();

            importFile(JSON.stringify(data));

            await waitFor(() => expect(alert).toHaveBeenCalledWith('El archivo no tiene el formato correcto'));
            expect(reload).not.toHaveBeenCalled();
            expect(readSubjects()).toEqual(sampleSubjects);
            expect(readCards()).toEqual(sampleCards);
        });

        it('[IO-04] un archivo que no es JSON muestra "Error al leer el archivo" y no toca los datos', async () => {
            const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
            renderHeader();

            importFile('esto no es json');

            await waitFor(() => expect(alert).toHaveBeenCalledWith('Error al leer el archivo'));
            expect(reload).not.toHaveBeenCalled();
            expect(readSubjects()).toEqual(sampleSubjects);
            expect(readCards()).toEqual(sampleCards);
        });

        it('[IO-02] cancelar el selector (sin archivo) no hace nada', () => {
            const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
            renderHeader();
            fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [] } });

            expect(alert).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
        });
    });
});
