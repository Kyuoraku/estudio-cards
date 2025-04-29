// src/components/CardForm.jsx
import { useState } from 'react'
import { TextField, Button, Box, Stack } from '@mui/material'
import { useApp } from '../context/AppContext'

export default function CardForm({ subjectId, card, onDone }) {
  const isNew = !card.id
  const [question, setQuestion] = useState(card.question || '')
  const [options, setOptions] = useState(card.options || ['', '', '', ''])
  const [answer, setAnswer] = useState(card.answer || '')
  const { addCard, updateCard } = useApp()

  function handleSave(e) {
    e.preventDefault()
    const payload = {
      subject_id: subjectId,
      question,
      options,
      answer
    }
    if (isNew) {
      addCard(payload)
    } else {
      updateCard(card.id, payload)
    }
    onDone()
  }

  function updateOption(i, v) {
    const o = [...options]
    o[i] = v
    setOptions(o)
  }

  return (
    <Box component="form" onSubmit={handleSave} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Stack spacing={2}>
        <TextField
          label="Pregunta"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          fullWidth
          required
        />

        {options.map((opt, i) => (
          <TextField
            key={i}
            label={`Opción ${i + 1}`}
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
            fullWidth
            required
          />
        ))}

        <TextField
          label="Respuesta correcta"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          fullWidth
          required
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onDone}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
          >
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
