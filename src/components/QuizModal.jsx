import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Stack, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const QuizModal = ({ open, onClose, subjectId }) => {
    const [currentCard, setCurrentCard] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        const allCards = JSON.parse(localStorage.getItem('estudio-cards-cards') || '[]');
        const subjectCards = allCards.filter(card => card.subject_id === subjectId);
        if (subjectCards.length > 0) {
            setCurrentCard(subjectCards[0]);
        }
    }, [subjectId]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        // TODO: Implementar la lógica de verificación de respuesta
        console.log('Respuesta seleccionada:', selectedOption);
    };

    if (!currentCard) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    backgroundColor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 24,
                    top: 24,
                    color: 'text.primary',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                marginBottom: 8
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        marginBottom: 4,
                        maxWidth: '800px'
                    }}
                >
                    {currentCard.question}
                </Typography>

                <Stack spacing={2} sx={{ width: '100%', maxWidth: '600px' }}>
                    {currentCard.options.map((option, index) => (
                        <Button
                            key={index}
                            variant={selectedOption === option ? "contained" : "outlined"}
                            onClick={() => handleOptionSelect(option)}
                            sx={{
                                justifyContent: 'flex-start',
                                padding: 2,
                                textTransform: 'none'
                            }}
                        >
                            {option.title}
                        </Button>
                    ))}
                </Stack>
            </Box>

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedOption}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    padding: '8px 24px'
                }}
            >
                Enviar
            </Button>
        </Dialog>
    );
};

export default QuizModal; 