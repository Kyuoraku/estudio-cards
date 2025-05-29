import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SubjectList({ onSelect, showManageOptions = false }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select()
      .order('created_at', { ascending: true })
    if (!error) setSubjects(data)
  }

  async function addSubject(e) {
    e.preventDefault()
    if (!name.trim()) return
    await supabase.from('subjects').insert({ name })
    setName('')
    fetchSubjects()
  }

  async function delSubject(id) {
    await supabase.from('subjects').delete().eq('id', id)
    fetchSubjects()
    onSelect(null)
  }

  return (
    <div className="subject-list">
      <h2>{showManageOptions ? 'Gestionar Materias' : 'Materias'}</h2>
      <ul className="subjects">
        {subjects.map(s => (
          <li key={s.id} className="subject-item">
            <button
              className="subject-button"
              onClick={() => onSelect(s.id)}
            >
              {s.name}
            </button>
            {showManageOptions && (
              <button
                className="delete-button"
                onClick={() => delSubject(s.id)}
              >
                🗑️
              </button>
            )}
          </li>
        ))}
      </ul>
      {showManageOptions && (
        <form onSubmit={addSubject} className="add-subject-form">
          <input
            placeholder="Nueva materia"
            value={name}
            onChange={e => setName(e.target.value)}
            className="subject-input"
          />
          <button className="add-button">➕</button>
        </form>
      )}
    </div>
  )
}

