import React, { useState } from 'react'
import { Box, Typography, Button, Stack } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'

const Quiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubjectCards } = useApp()
  const [currentCard, setCurrentCard] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const cards = getSubjectCards(id)

  const pick = () => {
    const randomIndex = Math.floor(Math.random() * cards.length)
    setCurrentCard(cards[randomIndex])
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswer = (option) => {
    setSelectedAnswer(option)
    setShowResult(true)
  }

  if (cards.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No hay tarjetas para hacer el quiz.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/subject/${id}`)}
        >
          ← Volver
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/subject/${id}`)}
        >
          ← Volver
        </Button>
      </Box>
      {currentCard && (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            {currentCard.question}
          </Typography>
          <Stack spacing={2} sx={{ mt: 3 }}>
            {currentCard.options.map((option, index) => (
              <Button
                key={index + ""}
                variant={selectedAnswer === option ? 'contained' : 'outlined'}
                color={
                  showResult
                    ? option.isCorrect
                      ? 'success'
                      : selectedAnswer === option
                        ? 'error'
                        : 'primary'
                    : 'primary'
                }
                onClick={() => !showResult && handleAnswer(option)}
                disabled={showResult}
              >
                {option.title}
              </Button>
            ))}
          </Stack>
          {showResult && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={pick}
              >
                Siguiente pregunta
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Quiz
