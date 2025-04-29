import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

const SubjectCard = ({ subject }) => {
    const navigate = useNavigate();

    return (
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
                </Box>
            </CardContent>
        </Card>
    );
};

export default SubjectCard; 