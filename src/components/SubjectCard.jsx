import React from 'react';
import { Card, CardContent, Typography, Button, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SubjectCard = ({ subject }) => {
    const navigate = useNavigate();
    const { deleteSubject } = useApp();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

    const handleDeleteSubject = () => {
        deleteSubject(subject.id);
        setOpenDeleteDialog(false);
    };

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: 6
                    }
                }}
                onClick={() => navigate(`/subject/${subject.id}`)}
            >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'inline-block', marginBottom: 0 }}>
                        {subject.name}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                    }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/quiz/${subject.id}`);
                            }}
                            startIcon={<PlayArrowIcon />}
                        >
                            Quiz
                        </Button>
                        <IconButton
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDeleteDialog(true);
                            }}
                            aria-label="eliminar materia"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{
                    sx: {
                        fontFamily: 'Roboto, sans-serif'
                    }
                }}
            >
                <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>
                    Eliminar materia
                </DialogTitle>
                <DialogContent sx={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Typography sx={{ fontFamily: 'Roboto, sans-serif' }}>
                        ¿Estás seguro que deseas eliminar la materia "{subject.name}"? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteSubject}
                        color="error"
                        variant="contained"
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SubjectCard; 