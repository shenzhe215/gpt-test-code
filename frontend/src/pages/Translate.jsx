import React, { useState } from 'react'
import { api } from '../services/api.js'

export default function Translate() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onTranslate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.translate(input, 'zh', 'en')
      setOutput(res.translated_text)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p>将中文翻译为英文（演示使用占位翻译，可替换为真实服务）。</p>
      <textarea
        rows={6}
        style={{ width: '100%', boxSizing: 'border-box' }}
        placeholder="输入中文..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ margin: '8px 0' }}>
        <button onClick={onTranslate} disabled={loading || !input.trim()}>
          {loading ? '翻译中...' : '翻译'}
        </button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h4>结果</h4>
      <textarea
        rows={6}
        readOnly
        style={{ width: '100%', boxSizing: 'border-box' }}
        value={output}
      />
    </div>
  )
}

