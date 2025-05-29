import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Typography, Button, IconButton, Stack
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const shuffleArray = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const QuizView = () => {
  const navigate = useNavigate()
  const { id } = useParams()            
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = cards[currentIndex]

  const [selectedOptions, setSelectedOptions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('estudio-cards-cards') || '[]')
    const subjectCards = all.filter(c => c.subject_id === id)
    setCards(shuffleArray(subjectCards))
  }, [id])

  const handleClose = () => navigate(`/subject/${id}`)

  const handleOptionClick = (idx) => {
    if (answered) return
    if (currentCard.type === 'single') {
      setSelectedOptions([idx])
    } else {
      setSelectedOptions(prev =>
        prev.includes(idx)
          ? prev.filter(i => i !== idx)
          : [...prev, idx]
      )
    }
  }

  const handleSubmit = () => {
    const correctIdxs = currentCard.options
      .map((o, i) => o.isCorrect ? i : null)
      .filter(i => i !== null)

    const selectedSorted = [...selectedOptions].sort()
    const correctSorted  = [...correctIdxs].sort()
    const ok = selectedSorted.length === correctSorted.length
      && selectedSorted.every((v,i) => v === correctSorted[i])

    setIsCorrect(ok)
    setAnswered(true)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOptions([])
      setAnswered(false)
    } else {
      handleClose()
    }
  }

  if (!currentCard) return null

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bg: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h4" mb={4} textAlign="center">
        {currentCard.question}
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
        {currentCard.options.map((opt, idx) => {
          const isSelected = selectedOptions.includes(idx)
          const isRight    = opt.isCorrect
          let variant = 'outlined'
          let color   = 'primary'

          if (answered) {
            if (isRight)      variant = 'contained', color = 'success'
            else if (isSelected) variant = 'contained', color = 'error'
          } else if (isSelected) {
            variant = 'contained'
          }

          return (
            <Button
              key={idx}
              variant={variant}
              color={color}
              onClick={() => handleOptionClick(idx)}
              disabled={answered && !isRight && !isSelected}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              {opt.title}
            </Button>
          )
        })}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        {!answered ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              currentCard.type === 'single'
                ? selectedOptions.length === 0
                : false
            }
          >
            Enviar
          </Button>
        ) : (
          <>
            <Typography
              variant="h6"
              color={isCorrect ? 'success.main' : 'error.main'}
              sx={{ alignSelf: 'center' }}
            >
              {isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </Typography>
            <Button variant="outlined" onClick={handleClose}>
              Salir
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {currentIndex < cards.length - 1 ? 'Siguiente' : 'Terminar'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}

export default QuizView
