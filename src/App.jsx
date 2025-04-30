// src/App.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Header from './components/Header'
import SubjectGrid from './components/SubjectGrid'
import CardList from './components/CardList'
import Quiz from './components/Quiz'
import Modal from './components/Modal'
import AddSubjectForm from './components/AddSubjectForm'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const AppContent = () => {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const location = useLocation()

  // Obtener el ID de la materia de la ruta actual
  const getSubjectId = () => {
    if (location.pathname.startsWith('/subject/')) {
      return location.pathname.split('/')[2]
    }
    if (location.pathname.startsWith('/quiz/')) {
      return location.pathname.split('/')[2]
    }
    return null
  }

  const handleManageSubjects = () => {
    setShowAddSubjectModal(true)
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header onManageSubjects={handleManageSubjects} subjectId={getSubjectId()} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<SubjectGrid />} />
            <Route path="/subject/:id" element={<CardList />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title="Agregar nueva materia"
      >
        <AddSubjectForm onClose={() => setShowAddSubjectModal(false)} />
      </Modal>
    </Container>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}