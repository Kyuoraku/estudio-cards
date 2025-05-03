import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Header = ({ onManageSubjects, subjectId, onStartQuiz }) => {
    const navigate = useNavigate();
    const { subjects, deleteSubject } = useApp();
    const selectedSubjectName = subjects.find(s => s.id === subjectId)?.name;
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

    const handleDeleteSubject = () => {
        deleteSubject(subjectId);
        setOpenDeleteDialog(false);
        navigate('/');
    };

    const handleExport = () => {
        const data = {
            subjects: subjects,
            cards: JSON.parse(localStorage.getItem('estudio-cards-cards') || '[]')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'estudio-cards-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.subjects && data.cards) {
                        localStorage.setItem('estudio-cards-subjects', JSON.stringify(data.subjects));
                        localStorage.setItem('estudio-cards-cards', JSON.stringify(data.cards));
                        window.location.reload();
                    } else {
                        alert('El archivo no tiene el formato correcto');
                    }
                } catch {
                    alert('Error al leer el archivo');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleStartQuiz = () => {
        onStartQuiz(subjectId);
    };

    return (
        <>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'primary.main'
                            },
                            display: 'inline-block',
                            width: 'auto'
                        }}
                        onClick={() => navigate('/')}
                    >
                        Estudio Cards
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {selectedSubjectName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                    color="primary"
                                    onClick={handleStartQuiz}
                                    aria-label="iniciar quiz"
                                    size="medium"
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                                <Typography variant="subtitle1" sx={{
                                    display: 'flex',
                                    color: 'text.primary'
                                }}>
                                    {selectedSubjectName}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box>
                        {selectedSubjectName ? (
                            <IconButton
                                color="error"
                                onClick={() => setOpenDeleteDialog(true)}
                                aria-label="eliminar materia"
                            >
                                <DeleteIcon />
                            </IconButton>
                        ) : (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    onClick={onManageSubjects}
                                >
                                    Nueva Materia
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<FileUploadIcon />}
                                    component="label"
                                >
                                    Importar <input type="file" hidden accept=".json" onChange={handleImport} />
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExport}
                                >
                                    Exportar
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Eliminar materia</DialogTitle>
                <DialogContent>
                    ¿Estás seguro que deseas eliminar la materia "{selectedSubjectName}"? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteSubject} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

Header.propTypes = {
    onManageSubjects: PropTypes.func.isRequired,
    subjectId: PropTypes.string,
    onStartQuiz: PropTypes.func.isRequired
};

export default Header; 