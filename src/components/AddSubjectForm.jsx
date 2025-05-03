import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useApp } from '../hooks/useApp';
import { Box, TextField, Button, Stack, Typography } from '@mui/material';

const AddSubjectForm = ({ onClose }) => {
    const [name, setName] = useState('');
    const { addSubject } = useApp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        addSubject({ name });
        onClose();
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Stack spacing={3}>
                <TextField
                    id="subjectName"
                    label="Nombre de la materia"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Matemáticas"
                    fullWidth
                    autoFocus
                />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                    >
                        Agregar materia
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default AddSubjectForm; 