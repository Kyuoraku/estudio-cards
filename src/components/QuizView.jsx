import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const QuizView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentCard, setCurrentCard] = useState(null);
    const [cards, setCards] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        const allCards = JSON.parse(localStorage.getItem('estudio-cards-cards') || '[]');
        const subjectCards = allCards.filter(card => card.subject_id === id);
        setCards(subjectCards);
        if (subjectCards.length > 0) {
            setCurrentCard(subjectCards[0]);
        }
    }, [id]);

    const handleClose = () => {
        navigate(`/subject/${id}`);
    };

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
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: 'text.primary'
                }}
            >
                <CloseIcon />
            </IconButton>

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

            <Stack spacing={2} sx={{ width: '100%', maxWidth: '600px', marginBottom: 4 }}>
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

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedOption}
                sx={{
                    alignSelf: 'flex-end',
                    marginRight: 4
                }}
            >
                Enviar
            </Button>
        </Box>
    );
};

export default QuizView; 