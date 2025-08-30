import React, { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, mode, onAuthSuccess, onModeChange }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [baiduAppId, setBaiduAppId] = useState('');
  const [baiduSecretKey, setBaiduSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 当外部mode改变时更新内部状态
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // 当模态框打开时重置表单
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setBaiduAppId('');
      setBaiduSecretKey('');
      setError('');
    }
  }, [isOpen, currentMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (currentMode === 'login') {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
      } else {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username, 
            password,
            baidu_app_id: baiduAppId,
            baidu_secret_key: baiduSecretKey
          }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '操作失败');
      }
      
      const data = await response.json();
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{currentMode === 'login' ? '登录' : '注册'}</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
              minLength="3"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
              minLength="6"
            />
          </div>
          
          {currentMode === 'register' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>百度翻译 App ID</label>
                <input
                  type="text"
                  value={baiduAppId}
                  onChange={(e) => setBaiduAppId(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>百度翻译 Secret Key</label>
                <input
                  type="password"
                  value={baiduSecretKey}
                  onChange={(e) => setBaiduSecretKey(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  required
                />
              </div>
            </>
          )}
          
          {error && (
            <div style={{ color: 'red', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                flex: 1, 
                padding: '10px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '处理中...' : (currentMode === 'login' ? '登录' : '注册')}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              style={{ 
                flex: 1, 
                padding: '10px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
          </div>
          
          {currentMode === 'login' ? (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              没有账户？ 
              <button 
                type="button"
                onClick={() => handleModeChange('register')}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                点击注册
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              已有账户？ 
              <button 
                type="button"
                onClick={() => handleModeChange('login')}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                点击登录
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}