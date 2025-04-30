// src/components/CardList.jsx
import React from 'react'
import { Box, Typography, Button, Stack, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCardTypeLabel } from '../lib/localStorage'
import Modal from './Modal'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const CardList = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubjectCards, deleteCard, addCard, updateCard } = useApp()
  const [showAddCardModal, setShowAddCardModal] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState(null)
  const [newCard, setNewCard] = React.useState({
    question: '',
    type: 'single',
    hint: '',
    solution: '',
    subject_id: id,
    options: [],
    correctOption: ''
  })
  const cards = getSubjectCards(id)

  console.log('Materia ID:', id)
  console.log('Tarjetas encontradas:', cards)

  const handleAddCard = () => {
    if (newCard.question.trim()) {
      const cardData = {
        ...newCard,
        subject_id: id,
        created_at: new Date().toISOString()
      }

      console.log('Guardando tarjeta:', cardData)

      if (editingCard) {
        updateCard(editingCard.id, cardData)
      } else {
        addCard(cardData)
      }

      setShowAddCardModal(false)
      setEditingCard(null)
      setNewCard({
        question: '',
        type: 'single',
        hint: '',
        solution: '',
        subject_id: id,
        options: [],
        correctOption: ''
      })
    }
  }

  const handleEditCard = (card) => {
    setEditingCard(card)
    setNewCard({
      question: card.question,
      type: card.type,
      hint: card.hint || '',
      solution: card.solution || '',
      subject_id: id,
      options: card.options || [],
      correctOption: card.correctOption || ''
    })
    setShowAddCardModal(true)
  }

  const handleDeleteCard = (cardId) => {
    if (window.confirm('¿Estás seguro que deseas eliminar esta tarjeta?')) {
      deleteCard(cardId)
    }
  }

  const handleAddOption = () => {
    setNewCard(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const handleOptionChange = (index, value) => {
    setNewCard(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const handleDeleteOption = (index) => {
    setNewCard(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctOption: prev.correctOption === index ? '' : prev.correctOption
    }))
  }

  const handleCorrectOptionChange = (index) => {
    setNewCard(prev => ({
      ...prev,
      correctOption: index
    }))
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
          onClose={() => {
            setShowAddCardModal(false)
            setEditingCard(null)
            setNewCard({
              question: '',
              type: 'single',
              hint: '',
              solution: '',
              subject_id: id,
              options: [],
              correctOption: ''
            })
          }}
          title={editingCard ? "Editar tarjeta" : "Agregar nueva tarjeta"}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Pregunta"
              fullWidth
              value={newCard.question}
              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de pregunta</InputLabel>
              <Select
                value={newCard.type}
                label="Tipo de pregunta"
                onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
              >
                <MenuItem value="single">Respuesta única</MenuItem>
                <MenuItem value="multiple">Respuesta múltiple</MenuItem>
                <MenuItem value="fill">Completar palabras</MenuItem>
              </Select>
            </FormControl>
            {newCard.type === 'single' && (
              <Box sx={{ mt: 2 }}>
                <FormLabel component="legend">Opciones de respuesta</FormLabel>
                <RadioGroup
                  value={newCard.correctOption}
                  onChange={(e) => handleCorrectOptionChange(parseInt(e.target.value))}
                >
                  {newCard.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Radio value={index} />
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOption(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
                <Button
                  variant="outlined"
                  onClick={handleAddOption}
                  sx={{ mt: 1 }}
                >
                  Agregar opción
                </Button>
              </Box>
            )}
            <TextField
              label="Pista (opcional)"
              fullWidth
              value={newCard.hint}
              onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
            />
            <TextField
              label="Solución (opcional)"
              fullWidth
              multiline
              rows={2}
              value={newCard.solution}
              onChange={(e) => setNewCard({ ...newCard, solution: e.target.value })}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => {
                setShowAddCardModal(false)
                setEditingCard(null)
                setNewCard({
                  question: '',
                  type: 'single',
                  hint: '',
                  solution: '',
                  subject_id: id,
                  options: [],
                  correctOption: ''
                })
              }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleAddCard}>
                {editingCard ? 'Guardar cambios' : 'Guardar'}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    )
  }

  return (
    <Box>
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
              <TableCell>Pista</TableCell>
              <TableCell>Solución</TableCell>
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
                <TableCell>{card.hint || '-'}</TableCell>
                <TableCell>{card.solution || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(card);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id);
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
        onClose={() => {
          setShowAddCardModal(false)
          setEditingCard(null)
          setNewCard({
            question: '',
            type: 'single',
            hint: '',
            solution: '',
            subject_id: id,
            options: [],
            correctOption: ''
          })
        }}
        title={editingCard ? "Editar tarjeta" : "Agregar nueva tarjeta"}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Pregunta"
            fullWidth
            value={newCard.question}
            onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Tipo de pregunta</InputLabel>
            <Select
              value={newCard.type}
              label="Tipo de pregunta"
              onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
            >
              <MenuItem value="single">Respuesta única</MenuItem>
              <MenuItem value="multiple">Respuesta múltiple</MenuItem>
              <MenuItem value="fill">Completar palabras</MenuItem>
            </Select>
          </FormControl>
          {newCard.type === 'single' && (
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Opciones de respuesta</FormLabel>
              <RadioGroup
                value={newCard.correctOption}
                onChange={(e) => handleCorrectOptionChange(parseInt(e.target.value))}
              >
                {newCard.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Radio value={index} />
                    <TextField
                      fullWidth
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteOption(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </RadioGroup>
              <Button
                variant="outlined"
                onClick={handleAddOption}
                sx={{ mt: 1 }}
              >
                Agregar opción
              </Button>
            </Box>
          )}
          <TextField
            label="Pista (opcional)"
            fullWidth
            value={newCard.hint}
            onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
          />
          <TextField
            label="Solución (opcional)"
            fullWidth
            multiline
            rows={2}
            value={newCard.solution}
            onChange={(e) => setNewCard({ ...newCard, solution: e.target.value })}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => {
              setShowAddCardModal(false)
              setEditingCard(null)
              setNewCard({
                question: '',
                type: 'single',
                hint: '',
                solution: '',
                subject_id: id,
                options: [],
                correctOption: ''
              })
            }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleAddCard}>
              {editingCard ? 'Guardar cambios' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default CardList
