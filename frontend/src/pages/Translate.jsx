import React, { useState, useEffect } from 'react';

export default function Translate({ token }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onTranslate = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: input,
          source_lang: 'zh',
          target_lang: 'en'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const res = await response.json();
      setOutput(res.translated_text);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>将中文翻译为英文。</p>
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
  );
}