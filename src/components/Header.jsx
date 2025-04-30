import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DeleteIcon from '@mui/icons-material/Delete';

const Header = ({ onManageSubjects, subjectId }) => {
    const navigate = useNavigate();
    const { subjects, deleteSubject } = useApp();
    const selectedSubjectName = subjects.find(s => s.id === subjectId)?.name;
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

    const handleDeleteSubject = () => {
        deleteSubject(subjectId);
        setOpenDeleteDialog(false);
        navigate('/');
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

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                        {selectedSubjectName && (
                            <Typography variant="subtitle1" sx={{
                                display: 'flex',
                                color: 'text.primary'
                            }}>
                                {selectedSubjectName}
                            </Typography>
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
                            <Button
                                variant="outlined"
                                onClick={onManageSubjects}
                            >
                                Nueva Materia
                            </Button>
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

export default Header; 