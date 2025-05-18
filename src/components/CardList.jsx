// src/components/CardList.jsx
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, Button, Stack, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { getCardTypeLabel } from '../lib/localStorage'
import Modal from './Modal'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import QuizModal from './QuizModal'

const CardList = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubjectCards, deleteCard, addCard, updateCard } = useApp()
  const [showAddCardModal, setShowAddCardModal] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState(null)
  const cards = getSubjectCards(id)
  const [showQuizModal, setShowQuizModal] = useState(false)

  console.log('Materia ID:', id)
  console.log('Tarjetas encontradas:', cards)

  const handleCloseModal = () => {
    setShowAddCardModal(false)
    setEditingCard(null)
  }

  const handleEditCard = (card) => {
    setEditingCard(card)
    setShowAddCardModal(true)
  }

  const handleDeleteCard = (cardId) => {
    if (window.confirm('¿Estás seguro que deseas eliminar esta tarjeta?')) {
      deleteCard(cardId)
    }
  }

  const AddCardForm = ({ onClose, subjectId, editingCard }) => {
    AddCardForm.propTypes = {
      onClose: PropTypes.func.isRequired,
      subjectId: PropTypes.string.isRequired,
      editingCard: PropTypes.object
    }
    const [question, setQuestion] = useState(editingCard?.question || '')
    const [type, setType] = useState(editingCard?.type || 'single')
    const [options, setOptions] = useState(editingCard?.options || [])
    const [error, setError] = useState('')
  
    const handleAddOption = () => {
      setOptions([...options, { title: '', isCorrect: false }])
    }
  
    const handleChangeOption = (index, value) => {
      const newOptions = [...options]
      newOptions[index].title = value
      setOptions(newOptions)
      setError('')
    }
  
    const handleDeleteOption = (index) => {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      setError('')
    }
  
    const handleSetCorrectOption = (index) => {
      // Para respuesta única: solo una puede ser correcta
      const newOptions = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }))
      setOptions(newOptions)
      setError('')
    }
  
    const handleToggleCorrectOption = (index) => {
      // Para respuesta múltiple: se pueden alternar
      const newOptions = options.map((opt, i) =>
        i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
      )
      setOptions(newOptions)
      setError('')
    }
  
    const handleSubmit = (e) => {
      e.preventDefault()
      setError('')
  
      if (!question.trim()) {
        setError('La pregunta no puede estar vacía')
        return
      }
  
      if (options.length === 0) {
        setError('Debes agregar al menos una opción')
        return
      }
  
      if (options.some(opt => !opt.title.trim())) {
        setError('Todas las opciones deben tener texto')
        return
      }
  
      if (type === 'single' && !options.some(opt => opt.isCorrect)) {
        setError('Debes seleccionar una opción correcta para preguntas de respuesta única')
        return
      }
  
      const cardData = {
        subject_id: subjectId,
        question,
        type,
        options
      }
  
      if (editingCard) {
        updateCard(editingCard.id, cardData)
      } else {
        addCard(cardData)
      }
  
      onClose()
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Pregunta"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setError('')
            }}
            required
            fullWidth
            error={error && !question.trim()}
          />
  
          <FormControl fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setError('')
                // Resetear opciones correctas si se cambia a "single"
                if (e.target.value === 'single' && options.filter(o => o.isCorrect).length > 1) {
                  const firstCorrect = options.findIndex(o => o.isCorrect)
                  setOptions(options.map((opt, i) => ({
                    ...opt,
                    isCorrect: i === firstCorrect
                  })))
                }
              }}
              label="Tipo de pregunta"
            >
              <MenuItem value="single">Respuesta única</MenuItem>
              <MenuItem value="multiple">Respuesta múltiple</MenuItem>
            </Select>
          </FormControl>
  
          <Typography variant="subtitle1">Opciones:</Typography>
          {options.map((option, index) => (
            <Box key={`${option.title}-${index}`} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                value={option.title}
                onChange={(e) => handleChangeOption(index, e.target.value)}
                placeholder={`Opción ${index + 1}`}
                fullWidth
                required
                error={error && !option.title.trim()}
              />
              <IconButton
                color={option.isCorrect ? 'success' : 'default'}
                onClick={() =>
                  type === 'single'
                    ? handleSetCorrectOption(index)
                    : handleToggleCorrectOption(index)
                }
                title={
                  option.isCorrect
                    ? 'Opción marcada como correcta'
                    : 'Marcar como correcta'
                }
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDeleteOption(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
  
          <Button
            variant="outlined"
            onClick={handleAddOption}
            startIcon={<AddIcon />}
          >
            Agregar opción
          </Button>
  
          {error && (
            <Alert severity="error">{error}</Alert>
          )}
  
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingCard ? 'Guardar cambios' : 'Guardar'}
            </Button>
          </Box>
        </Stack>
      </form>
    )
  }
  

  if (cards.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No hay tarjetas en esta materia.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAddCardModal(true)}
        >
          Agregar tarjeta
        </Button>
        <Modal
          isOpen={showAddCardModal}
          onClose={handleCloseModal}
          title="Agregar nueva tarjeta"
        >
          <AddCardForm
            onClose={handleCloseModal}
            subjectId={id}
            editingCard={editingCard}
          />
        </Modal>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            ← Volver
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddCardModal(true)}
          >
            Nueva tarjeta
          </Button>
        </Stack>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de tarjetas">
            <TableHead>
              <TableRow>
                <TableCell>Pregunta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Opciones</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((card) => (
                <TableRow
                  key={card.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => handleEditCard(card)}
                >
                  <TableCell component="th" scope="row">
                    {card.question}
                  </TableCell>
                  <TableCell>{getCardTypeLabel(card.type)}</TableCell>
                  <TableCell>{card.options.length}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCard(card)
                      }}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCard(card.id)
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          isOpen={showAddCardModal}
          onClose={handleCloseModal}
          title={editingCard ? "Editar tarjeta" : "Agregar nueva tarjeta"}
        >
          <AddCardForm
            onClose={handleCloseModal}
            subjectId={id}
            editingCard={editingCard}
          />
        </Modal>
      </Box>
      <QuizModal open={showQuizModal} onClose={() => setShowQuizModal(false)} />
    </>
  )
}

export default CardList
