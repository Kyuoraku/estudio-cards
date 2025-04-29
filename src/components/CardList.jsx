// src/components/CardList.jsx
import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CardForm from './CardForm'
import Modal from './Modal'

const CardList = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubjectCards, deleteCard } = useApp()
  const [showAddCardModal, setShowAddCardModal] = React.useState(false)
  const cards = getSubjectCards(id)

  const handleDeleteCard = (cardId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      deleteCard(cardId)
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
          <CardForm
            subjectId={id}
            onClose={() => setShowAddCardModal(false)}
          />
        </Modal>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          ← Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAddCardModal(true)}
        >
          Agregar tarjeta
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cards.map(card => (
          <Box
            key={card.id}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography>{card.question}</Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteCard(card.id)}
            >
              Eliminar
            </Button>
          </Box>
        ))}
      </Box>
      <Modal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        title="Agregar nueva tarjeta"
      >
        <CardForm
          subjectId={id}
          onClose={() => setShowAddCardModal(false)}
        />
      </Modal>
    </Box>
  )
}

export default CardList
