const jsonHeaders = { 'Content-Type': 'application/json' }

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function get(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  translate: (text, source_lang = 'zh', target_lang = 'en') =>
    post('/api/translate', { text, source_lang, target_lang }),

  evaluateWriting: (text) => post('/api/write/evaluate', { text }),

  logPractice: (type, amount = 1) => post('/api/practice/log', { type, amount }),

  getStats: (dateStr) => get(`/api/practice/stats${dateStr ? `?date_str=${encodeURIComponent(dateStr)}` : ''}`),

  addCard: (front, back) => post('/api/cards', { front, back }),

  getDueCards: () => get('/api/review/today'),

  gradeCard: (id, quality) => post('/api/review/grade', { id, quality })
}

