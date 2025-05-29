// src/components/CardList.jsx
import React, { useState, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert
} from '@mui/material'
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
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const cards = getSubjectCards(id)
  const [showQuizModal, setShowQuizModal] = useState(false)

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

    // Ref & memo para generar IDs estables sin dependencias externas
    const nextOptionId = useRef(0)
    const initialOptionsMeta = useMemo(
      () => (editingCard?.options || []).map(opt => ({
        id: nextOptionId.current++,
        title: opt.title,
        isCorrect: opt.isCorrect
      })),
      [editingCard]
    )

    const [question, setQuestion] = useState(editingCard?.question || '')
    const [type, setType] = useState(editingCard?.type || 'single')
    const [optionsMeta, setOptionsMeta] = useState(initialOptionsMeta)
    const [error, setError] = useState('')
    const questionRef = useRef(null)
    const optionRefs = useRef([])

    const handleAddOption = () => {
      setOptionsMeta(meta => [
        ...meta,
        { id: nextOptionId.current++, title: '', isCorrect: false }
      ])
    }

    const handleDeleteOption = (id) => {
      setOptionsMeta(oldMeta => {
        const idx = oldMeta.findIndex(m => m.id === id)
        if (idx > -1) optionRefs.current.splice(idx, 1)
        return oldMeta.filter(m => m.id !== id)
      })
      setError('')
    }

    const handleSetCorrectOption = (id) => {
      setOptionsMeta(meta =>
        meta.map(m => ({ ...m, isCorrect: m.id === id }))
      )
      setError('')
    }

    const handleToggleCorrectOption = (id) => {
      setOptionsMeta(meta =>
        meta.map(m =>
          m.id === id ? { ...m, isCorrect: !m.isCorrect } : m
        )
      )
      setError('')
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      setError('')

      const qText = questionRef.current?.value.trim() || ''
      if (!qText) {
        setError('La pregunta no puede estar vacía')
        return
      }

      const collectedOptions = optionsMeta.map((m, idx) => ({
        title: optionRefs.current[idx]?.value.trim() || '',
        isCorrect: m.isCorrect
      }))

      if (collectedOptions.length === 0) {
        setError('Debes agregar al menos una opción')
        return
      }
      if (collectedOptions.some(opt => !opt.title)) {
        setError('Todas las opciones deben tener texto')
        return
      }
      if (type === 'single' && !collectedOptions.some(opt => opt.isCorrect)) {
        setError(
          'Debes seleccionar una opción correcta para preguntas de respuesta única'
        )
        return
      }

      const cardData = {
        subject_id: subjectId,
        question: qText,
        type,
        options: collectedOptions
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
            defaultValue={editingCard?.question || ''}
            inputRef={questionRef}
            fullWidth
            required
            onChange={() => setError('')}
            error={Boolean(error && !questionRef.current?.value.trim())}
          />

          <FormControl fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={type}
              onChange={e => {
                const newType = e.target.value
                setType(newType)
                setError('')
                if (
                  newType === 'single' &&
                  optionsMeta.filter(o => o.isCorrect).length > 1
                ) {
                  const firstCorrect = optionsMeta.find(m => m.isCorrect)?.id
                  setOptionsMeta(met =>
                    met.map(o => ({ ...o, isCorrect: o.id === firstCorrect }))
                  )
                }
              }}
              label="Tipo de pregunta"
            >
              <MenuItem value="single">Respuesta única</MenuItem>
              <MenuItem value="multiple">Respuesta múltiple</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle1">Opciones:</Typography>
          {optionsMeta.map((meta, idx) => (
            <Box key={meta.id} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                defaultValue={meta.title}
                inputRef={el => (optionRefs.current[idx] = el)}
                placeholder={`Opción ${idx + 1}`}
                fullWidth
                required
                onChange={() => setError('')}
                error={Boolean(error && !optionRefs.current[idx]?.value.trim())}
              />
              <IconButton
                color={meta.isCorrect ? 'success' : 'default'}
                onClick={() =>
                  type === 'single'
                    ? handleSetCorrectOption(meta.id)
                    : handleToggleCorrectOption(meta.id)
                }
                title={
                  meta.isCorrect
                    ? 'Opción marcada como correcta'
                    : 'Marcar como correcta'
                }
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDeleteOption(meta.id)}
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

          {error && <Alert severity="error">{error}</Alert>}

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
        <Button variant="contained" onClick={() => setShowAddCardModal(true)}>
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
          <Button variant="outlined" onClick={() => navigate('/')}>← Volver</Button>
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
              {cards.map(card => (
                <TableRow
                  key={card.id}
                  onClick={() => handleEditCard(card)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <TableCell component="th" scope="row">{card.question}</TableCell>
                  <TableCell>{getCardTypeLabel(card.type)}</TableCell>
                  <TableCell>{card.options.length}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="edit"
                      onClick={e => { e.stopPropagation(); handleEditCard(card) }}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={e => { e.stopPropagation(); handleDeleteCard(card.id) }}
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
          title={editingCard ? 'Editar tarjeta' : 'Agregar nueva tarjeta'}
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

export default CardList;
