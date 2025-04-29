import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Header = ({ onManageSubjects, selectedSubject }) => {
    const navigate = useNavigate();
    const { subjects } = useApp();
    const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name;

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        color: 'text.primary',
                        cursor: 'pointer',
                        '&:hover': {
                            color: 'primary.main'
                        }
                    }}
                    onClick={() => navigate('/')}
                >
                    Estudio Cards
                </Typography>
                <Stack direction="row" spacing={2}>
                    {selectedSubjectName && (
                        <Typography variant="subtitle1" sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.primary'
                        }}>
                            {selectedSubjectName}
                        </Typography>
                    )}
                    {!selectedSubjectName && <Button
                        variant="outlined"
                        onClick={onManageSubjects}
                    >
                        Nueva Materia
                    </Button>}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 