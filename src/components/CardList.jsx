// src/components/CardList.jsx
import React from 'react'
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Stack, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CardForm from './CardForm'
import Modal from './Modal'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const CardList = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubjectCards, deleteCard } = useApp()
  const [editing, setEditing] = React.useState(null)
  const [showAddCardModal, setShowAddCardModal] = React.useState(false)
  const [newCard, setNewCard] = React.useState({
    question: '',
    type: 'single',
    hint: '',
    solution: ''
  })
  const cards = getSubjectCards(id)

  const handleAddCard = () => {
    if (newCard.question.trim()) {
      // Aquí iría la lógica para guardar la tarjeta
      setShowAddCardModal(false)
      setNewCard({
        question: '',
        type: 'single',
        hint: '',
        solution: ''
      })
    }
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
          onClose={() => setShowAddCardModal(false)}
          title="Agregar nueva tarjeta"
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
              <Button onClick={() => setShowAddCardModal(false)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleAddCard}>
                Guardar
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
          Nueva
        </Button>
      </Stack>

      <List>
        {cards.map(card => (
          <ListItem
            key={card.id}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemText primary={card.question} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => setEditing(card)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteCard(card.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Modal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        title="Agregar nueva tarjeta"
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
            <Button onClick={() => setShowAddCardModal(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleAddCard}>
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default CardList
