import React, { useState, useEffect } from 'react'
import { api } from '../services/api.js'

export default function Translate() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 百度翻译配置状态
  const [showConfig, setShowConfig] = useState(false)
  const [appId, setAppId] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [configStatus, setConfigStatus] = useState(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configMessage, setConfigMessage] = useState('')

  // 组件加载时检查配置状态
  useEffect(() => {
    checkConfigStatus()
  }, [])

  const checkConfigStatus = async () => {
    try {
      const status = await api.getBaiduConfigStatus()
      setConfigStatus(status)
      if (status.is_configured && status.app_id_masked) {
        setAppId(status.app_id_masked)
      }
    } catch (e) {
      console.error('检查配置状态失败:', e)
    }
  }

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

  const onSaveConfig = async () => {
    if (!appId.trim() || !secretKey.trim()) {
      setConfigMessage('请填写App ID和Secret Key')
      return
    }

    setConfigLoading(true)
    setConfigMessage('')
    try {
      await api.configureBaiduTranslate({
        app_id: appId,
        secret_key: secretKey
      })
      setConfigMessage('配置保存成功')
      // 清空Secret Key输入框以提高安全性
      setSecretKey('')
      // 更新配置状态
      await checkConfigStatus()
      // 隐藏配置面板
      setTimeout(() => {
        setShowConfig(false)
        setConfigMessage('')
      }, 1500)
    } catch (e) {
      setConfigMessage(`配置保存失败: ${String(e)}`)
    } finally {
      setConfigLoading(false)
    }
  }

  const onClearConfig = async () => {
    if (window.confirm('确定要清除百度翻译配置吗？')) {
      try {
        await api.clearBaiduConfig()
        setConfigMessage('配置已清除')
        setAppId('')
        setSecretKey('')
        await checkConfigStatus()
        setTimeout(() => setConfigMessage(''), 1500)
      } catch (e) {
        setConfigMessage(`清除配置失败: ${String(e)}`)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>翻译功能</h2>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          style={{ padding: '8px 16px' }}
        >
          {showConfig ? '隐藏配置' : '百度翻译配置'}
        </button>
      </div>

      {/* 百度翻译配置面板 */}
      {showConfig && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '16px', 
          marginBottom: '16px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>百度翻译API配置</h3>
          <p>请在百度翻译开放平台申请API Key: <a href="https://fanyi-api.baidu.com/" target="_blank" rel="noopener noreferrer">https://fanyi-api.baidu.com/</a></p>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              App ID:
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="请输入百度翻译App ID"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              Secret Key:
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="请输入百度翻译Secret Key"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          {configMessage && (
            <div style={{ 
              color: configMessage.includes('失败') ? 'red' : 'green', 
              marginBottom: '12px' 
            }}>
              {configMessage}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onSaveConfig} 
              disabled={configLoading}
              style={{ padding: '8px 16px' }}
            >
              {configLoading ? '保存中...' : '保存配置'}
            </button>
            {configStatus?.is_configured && (
              <button 
                onClick={onClearConfig}
                style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white' }}
              >
                清除配置
              </button>
            )}
          </div>
          
          {configStatus?.is_configured && (
            <div style={{ marginTop: '12px', color: 'green' }}>
              ✓ 已配置 (App ID: {configStatus.app_id_masked})
            </div>
          )}
        </div>
      )}

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
  )
}