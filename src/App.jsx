// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import { AppProvider } from './context/AppContext'
import QuizModal from './components/QuizModal'

const AppContent = () => {
  const [showAddSubjectModal, setShowAddSubjectModal] = React.useState(false)
  const location = useLocation()
  const [showSubjectDialog, setShowSubjectDialog] = React.useState(false)
  const [showQuizModal, setShowQuizModal] = React.useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = React.useState(null)

  const getSubjectId = () => {
    if (location.pathname.startsWith('/subject/')) {
      return location.pathname.split('/')[2]
    }
    if (location.pathname.startsWith('/quiz/')) {
      return location.pathname.split('/')[2]
    }
    return null
  }

  const handleStartQuiz = (subjectId) => {
    setSelectedSubjectId(subjectId)
    setShowQuizModal(true)
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        maxHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header
          onManageSubjects={() => setShowAddSubjectModal(true)}
          onStartQuiz={handleStartQuiz}
          subjectId={getSubjectId()}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<SubjectGrid showSubjectDialog={showSubjectDialog} setShowSubjectDialog={setShowSubjectDialog} />} />
            <Route path="/subject/:id" element={<CardList showSubjectDialog={showSubjectDialog} setShowSubjectDialog={setShowSubjectDialog} />} />
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
      <QuizModal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        subjectId={selectedSubjectId}
      />
    </Container>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App