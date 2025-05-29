import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import SubjectCard from './SubjectCard';
import { useApp } from '../hooks/useApp';

const SubjectGrid = () => {
    const { subjects } = useApp();

    if (subjects.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary'
                }}
            >
                <Typography variant="body1" gutterBottom>
                    No hay materias agregadas aún.
                </Typography>
                <Typography variant="body1">
                    Haz clic en "Agregar nuevas materias" para comenzar.
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'stretch' }}>
            {subjects.map((subject, index) => (
                <Grid item xs={12} sm={6} key={subject.id} >
                    <Box
                        sx={{
                            backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 2
                            },
                        }}
                    >
                        <SubjectCard subject={subject} />
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default SubjectGrid; 