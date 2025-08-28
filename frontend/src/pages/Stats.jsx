import React, { useEffect, useState } from 'react'
import { api } from '../services/api.js'

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

export default function Stats() {
  const [dateStr, setDateStr] = useState(formatDate(new Date()))
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setError('')
    try {
      const res = await api.getStats(dateStr)
      setStats(res)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [dateStr])

  return (
    <div>
      <p>每日练习统计（当天总量和7日历史）。</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>日期:</label>
        <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
        <button onClick={fetchStats}>刷新</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {stats && (
        <div style={{ marginTop: 12 }}>
          <h4>当天总量</h4>
          <div>翻译: {stats.totals.translation || 0}</div>
          <div>写作: {stats.totals.writing || 0}</div>
          <div>复习: {stats.totals.review || 0}</div>
          <h4 style={{ marginTop: 12 }}>最近7天</h4>
          <div>
            {stats.history_7d.map((d) => (
              <div key={d.date} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                <strong>{d.date}</strong>
                <span style={{ marginLeft: 8 }}>翻译: {d.totals.translation || 0}</span>
                <span style={{ marginLeft: 8 }}>写作: {d.totals.writing || 0}</span>
                <span style={{ marginLeft: 8 }}>复习: {d.totals.review || 0}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <h4>手动记录练习</h4>
            <button onClick={() => api.logPractice('translation', 1).then(fetchStats)}>+1 翻译</button>
            <button onClick={() => api.logPractice('writing', 1).then(fetchStats)} style={{ marginLeft: 8 }}>+1 写作</button>
            <button onClick={() => api.logPractice('review', 1).then(fetchStats)} style={{ marginLeft: 8 }}>+1 复习</button>
          </div>
        </div>
      )}
    </div>
  )
}

