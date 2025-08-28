import React from 'react'

const linkStyle = (active) => ({
  padding: '8px 12px',
  marginRight: 8,
  borderRadius: 6,
  border: '1px solid #ccc',
  background: active ? '#eef' : '#fff',
  cursor: 'pointer'
})

export default function NavBar({ current, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={linkStyle(current === 'translate')} onClick={() => onChange('translate')}>中译英</button>
      <button style={linkStyle(current === 'writing')} onClick={() => onChange('writing')}>英文写作</button>
      <button style={linkStyle(current === 'stats')} onClick={() => onChange('stats')}>每日练习统计</button>
      <button style={linkStyle(current === 'review')} onClick={() => onChange('review')}>每日复习</button>
    </div>
  )
}

