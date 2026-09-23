import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizModal from './QuizModal';
import { seedStorage, sampleSubjects, sampleCards } from '../test/utils';

const renderQuiz = (props = {}) => {
    const onClose = vi.fn();
    const utils = render(<QuizModal open onClose={onClose} subjectId="s1" {...props} />);
    return { onClose, ...utils };
};

const option = (title) => screen.getByText(title).closest('button');
const actionButton = () => screen.getByRole('button', { name: /^(Enviar|Siguiente)$/ });

// Specs: specs/06-quiz.md
describe('QuizModal', () => {
    beforeEach(() => {
        // subjectId se declara como number en propTypes pero la app pasa strings (BUG-04).
        vi.spyOn(console, 'error').mockImplementation(() => {});
        seedStorage({ subjects: sampleSubjects, cards: sampleCards });
    });

    it('[QUIZ-02] muestra a pantalla completa la primera tarjeta de la materia con sus opciones', () => {
        renderQuiz();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: sampleCards[0].question })).toBeInTheDocument();
        ['1810', '1816', '1853'].forEach(t => expect(option(t)).toBeEnabled());
        expect(screen.queryByText(sampleCards[2].question)).not.toBeInTheDocument();
        expect(actionButton()).toHaveTextContent('Enviar');
    });

    it('[QUIZ-02] no renderiza nada si está cerrado', () => {
        renderQuiz({ open: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('[QUIZ-02] no renderiza nada si la materia no tiene tarjetas', () => {
        renderQuiz({ subjectId: 'vacía' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('[QUIZ-03] respuesta única: "Enviar" se habilita al elegir y elegir otra reemplaza la selección', () => {
        renderQuiz();
        expect(actionButton()).toBeDisabled();

        fireEvent.click(option('1816'));
        expect(actionButton()).toBeEnabled();
        expect(option('1816')).toHaveClass('MuiButton-contained');

        fireEvent.click(option('1810'));
        expect(option('1810')).toHaveClass('MuiButton-contained');
        expect(option('1816')).toHaveClass('MuiButton-outlined');
    });

    it('[QUIZ-04] respuesta correcta: marca Verdadero/Falso, bloquea opciones y el botón "Siguiente" queda verde', () => {
        renderQuiz();
        fireEvent.click(option('1810'));
        fireEvent.click(actionButton());

        expect(actionButton()).toHaveTextContent('Siguiente');
        expect(actionButton()).toHaveClass('MuiButton-containedSuccess');
        expect(screen.getAllByText('Verdadero')).toHaveLength(1);
        expect(screen.getAllByText('Falso')).toHaveLength(2);
        ['1810', '1816', '1853'].forEach(t => expect(option(t)).toBeDisabled());
        expect(option('1810')).toHaveTextContent('1810Verdadero');
        expect(option('1816')).toHaveTextContent('1816Falso');
    });

    it('[QUIZ-04] respuesta incorrecta: el botón "Siguiente" queda rojo', () => {
        renderQuiz();
        fireEvent.click(option('1853'));
        fireEvent.click(actionButton());

        expect(actionButton()).toHaveClass('MuiButton-containedError');
        expect(option('1853')).toHaveClass('MuiButton-contained');
    });

    it('[QUIZ-05] tras enviar, las opciones no pueden cambiarse', () => {
        renderQuiz();
        fireEvent.click(option('1853'));
        fireEvent.click(actionButton());
        fireEvent.click(option('1810'));

        expect(option('1853')).toHaveClass('MuiButton-contained');
        expect(option('1810')).toHaveClass('MuiButton-outlined');
    });

    const goToMultiple = () => {
        fireEvent.click(option('1810'));
        fireEvent.click(actionButton());
        fireEvent.click(actionButton());
        expect(screen.getByRole('heading', { name: sampleCards[1].question })).toBeInTheDocument();
    };

    it('[QUIZ-06] respuesta múltiple: las opciones se marcan y desmarcan de forma independiente', () => {
        renderQuiz();
        goToMultiple();
        expect(actionButton()).toBeEnabled();

        fireEvent.click(option('San Martín'));
        fireEvent.click(option('Belgrano'));
        expect(option('San Martín')).toHaveClass('MuiButton-contained');
        expect(option('Belgrano')).toHaveClass('MuiButton-contained');

        fireEvent.click(option('San Martín'));
        expect(option('San Martín')).toHaveClass('MuiButton-outlined');
    });

    it('[QUIZ-07] respuesta múltiple: es correcta solo si se eligen exactamente todas las correctas', () => {
        renderQuiz();
        goToMultiple();
        fireEvent.click(option('Belgrano'));
        fireEvent.click(option('San Martín'));
        fireEvent.click(actionButton());

        expect(actionButton()).toHaveClass('MuiButton-containedSuccess');
        expect(screen.getAllByText('Verdadero')).toHaveLength(2);
        expect(screen.getAllByText('Falso')).toHaveLength(1);
    });

    it.each([
        ['incompleta', ['San Martín']],
        ['con una incorrecta de más', ['San Martín', 'Belgrano', 'Bolívar']],
        ['vacía', []],
    ])('[QUIZ-07] respuesta múltiple %s se marca como incorrecta', (_label, picks) => {
        renderQuiz();
        goToMultiple();
        picks.forEach(t => fireEvent.click(option(t)));
        fireEvent.click(actionButton());

        expect(actionButton()).toHaveClass('MuiButton-containedError');
    });

    it('[QUIZ-08] "Siguiente" avanza reiniciando la selección y en la última tarjeta cierra el quiz', () => {
        const { onClose } = renderQuiz();
        goToMultiple();
        expect(actionButton()).toHaveTextContent('Enviar');
        expect(option('San Martín')).toHaveClass('MuiButton-outlined');
        expect(screen.queryByText('Verdadero')).not.toBeInTheDocument();

        fireEvent.click(actionButton());
        fireEvent.click(actionButton());
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[QUIZ-09] el botón de cierre invoca onClose', () => {
        const { onClose } = renderQuiz();
        fireEvent.click(screen.getByTestId('CloseIcon').closest('button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[QUIZ-02] al cambiar de materia recarga las tarjetas y reinicia el progreso', () => {
        const { rerender, onClose } = renderQuiz();
        goToMultiple();

        rerender(<QuizModal open onClose={onClose} subjectId="s2" />);

        expect(screen.getByRole('heading', { name: sampleCards[2].question })).toBeInTheDocument();
        expect(actionButton()).toHaveTextContent('Enviar');
    });

    const reopen = (rerender, onClose) => {
        rerender(<QuizModal open={false} onClose={onClose} subjectId="s1" />);
        rerender(<QuizModal open onClose={onClose} subjectId="s1" />);
    };

    const expectFreshStart = () => {
        expect(screen.getByRole('heading', { name: sampleCards[0].question })).toBeInTheDocument();
        expect(actionButton()).toHaveTextContent('Enviar');
        expect(actionButton()).toBeDisabled();
        expect(screen.queryByText('Verdadero')).not.toBeInTheDocument();
        expect(screen.queryByText('Falso')).not.toBeInTheDocument();
        ['1810', '1816', '1853'].forEach(t => {
            expect(option(t)).toBeEnabled();
            expect(option(t)).toHaveClass('MuiButton-outlined');
        });
    };

    it('[QUIZ-12] reabrir el quiz tras cerrarlo a mitad empieza desde la primera tarjeta', () => {
        const { rerender, onClose } = renderQuiz();
        goToMultiple();
        fireEvent.click(option('San Martín'));

        reopen(rerender, onClose);

        expectFreshStart();
    });

    it('[QUIZ-12] reabrir el quiz tras terminarlo empieza desde la primera tarjeta', () => {
        const { rerender, onClose } = renderQuiz();
        goToMultiple();
        fireEvent.click(option('San Martín'));
        fireEvent.click(actionButton());
        fireEvent.click(actionButton());
        expect(onClose).toHaveBeenCalledTimes(1);

        reopen(rerender, onClose);

        expectFreshStart();
    });

    it('[QUIZ-12] reabrir el quiz tras enviar una respuesta no muestra el resultado anterior', () => {
        const { rerender, onClose } = renderQuiz();
        fireEvent.click(option('1853'));
        fireEvent.click(actionButton());
        expect(actionButton()).toHaveTextContent('Siguiente');

        reopen(rerender, onClose);

        expectFreshStart();
    });
});
