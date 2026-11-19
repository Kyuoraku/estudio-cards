import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

// Specs: specs/03-navegacion-layout.md
describe('Modal', () => {
    it('[NAV-06] muestra título y contenido cuando está abierto', () => {
        render(
            <Modal isOpen onClose={() => {}} title="Mi título">
                <p>Contenido</p>
            </Modal>
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Mi título')).toBeInTheDocument();
        expect(screen.getByText('Contenido')).toBeInTheDocument();
    });

    it('[NAV-06] no renderiza nada cuando está cerrado', () => {
        render(
            <Modal isOpen={false} onClose={() => {}} title="Mi título">
                <p>Contenido</p>
            </Modal>
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    it('[NAV-06] el botón de cerrar invoca onClose', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="T">
                <p>x</p>
            </Modal>
        );
        fireEvent.click(screen.getByLabelText('close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[NAV-06] la tecla Escape invoca onClose', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="T">
                <p>x</p>
            </Modal>
        );
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
