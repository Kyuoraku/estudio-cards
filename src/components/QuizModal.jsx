// src/components/QuizModal.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, Button, IconButton, Stack, Dialog } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const QuizModal = ({ open, onClose, subjectId }) => {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [showResult, setShowResult] = useState(false)

  // Cargo y barajo tarjetas
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('estudio-cards-cards') || '[]')
    const subjectCards = all.filter(c => c.subject_id === subjectId)
    setCards(subjectCards)
    setCurrentIndex(0)
    setSelectedOptions([])
    setShowResult(false)
  }, [subjectId])

  const currentCard = cards[currentIndex]
  if (!currentCard) return null

  // Toggle selección según tipo
  const handleOptionSelect = (idx) => {
    if (showResult) return
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
    setShowResult(true)
  }

  const handleNext = () => {
    const next = currentIndex + 1
    if (next < cards.length) {
      setCurrentIndex(next)
      setSelectedOptions([])
      setShowResult(false)
    } else {
      onClose()
    }
  }

  const getOptionColor = (idx) => {
    if (!showResult) return 'primary'
    const isCorrect = currentCard.options[idx].isCorrect
    if (isCorrect) return 'success'
    if (selectedOptions.includes(idx)) return 'error'
    return 'primary'
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
            sx: {
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                fontFamily: 'Roboto, sans-serif'
              }
        }
    }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute', top: 24, right: 24,
          color: 'text.primary', backgroundColor: 'background.paper',
          '&:hover': { backgroundColor: 'action.hover' }
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
        mb: 8
      }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
          {currentCard.question}
        </Typography>

        <Stack spacing={2} sx={{ width: '100%', maxWidth: '600px' }}>
          {currentCard.options.map((option, idx) => {
            const isSel = selectedOptions.includes(idx)
            return (
              <Button
                key={option.id || idx}
                variant={isSel ? 'contained' : 'outlined'}
                onClick={() => handleOptionSelect(idx)}
                disabled={showResult}
                sx={{
                  justifyContent: 'flex-start',
                  padding: 2,
                  textTransform: 'none',
                  color: getOptionColor(idx),
                  borderColor: getOptionColor(idx),
                  '&:hover': { borderColor: getOptionColor(idx) }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center'
                }}>
                  <Typography>{option.title}</Typography>
                  {showResult && (
                    <Typography color={option.isCorrect ? 'success.main' : 'error.main'}>
                      {option.isCorrect ? 'Verdadero' : 'Falso'}
                    </Typography>
                  )}
                </Box>
              </Button>
            )
          })}
        </Stack>
      </Box>

      <Button
        variant="contained"
        onClick={showResult ? handleNext : handleSubmit}
        disabled={!showResult && currentCard.type === 'single' && selectedOptions.length === 0}
        color={ showResult
          ? selectedOptions.every(i => currentCard.options[i].isCorrect) &&
            currentCard.options.filter(o => o.isCorrect).length === selectedOptions.length
            ? 'success'
            : 'error'
          : 'primary'
        }
        sx={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          padding: '8px 24px'
        }}
      >
        {showResult ? 'Siguiente' : 'Enviar'}
      </Button>
    </Dialog>
  )
}
QuizModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.number.isRequired
}

export default QuizModal
