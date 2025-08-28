import React, { useState } from 'react'
import { api } from '../services/api.js'

export default function Writing() {
  const [text, setText] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const evaluate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.evaluateWriting(text)
      setMetrics(res)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p>英文写作评估（字数、句长、可读性、建议）。</p>
      <textarea
        rows={10}
        style={{ width: '100%', boxSizing: 'border-box' }}
        placeholder="Write your English text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ margin: '8px 0' }}>
        <button onClick={evaluate} disabled={loading || !text.trim()}>
          {loading ? '分析中...' : '分析写作'}
        </button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {metrics && (
        <div style={{ marginTop: 12 }}>
          <h4>分析结果</h4>
          <div>单词数: {metrics.word_count}</div>
          <div>句子数: {metrics.sentence_count}</div>
          <div>不同单词数: {metrics.unique_words}</div>
          <div>平均句长: {metrics.avg_sentence_length}</div>
          <div>Flesch 可读性: {metrics.flesch_reading_ease}</div>
          <div>估算年级: {metrics.estimated_grade_level}</div>
          {metrics.suggestions?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>建议:</strong>
              <ul>
                {metrics.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

