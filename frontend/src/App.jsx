import React, { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import Translate from './pages/Translate.jsx'
import Writing from './pages/Writing.jsx'
import Stats from './pages/Stats.jsx'
import Review from './pages/Review.jsx'

const containerStyle = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '16px'
}

export default function App() {
  const [view, setView] = useState('translate')

  return (
    <div style={containerStyle}>
      <h1>English Learning App</h1>
      <NavBar current={view} onChange={setView} />
      <div style={{ marginTop: 16 }}>
        {view === 'translate' && <Translate />}
        {view === 'writing' && <Writing />}
        {view === 'stats' && <Stats />}
        {view === 'review' && <Review />}
      </div>
    </div>
  )
}

