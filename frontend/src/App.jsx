import React, { useState, useEffect } from 'react';
import Translate from './pages/Translate';
import Writing from './pages/Writing';
import Review from './pages/Review';
import Stats from './pages/Stats';
import AuthModal from './components/AuthModal';

function App() {
  const [activeTab, setActiveTab] = useState('translate');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  // 检查本地存储的认证信息
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // 如果没有认证信息，打开登录模态框
      setIsAuthModalOpen(true);
      setAuthMode('login');
    }
  }, []);

  const handleAuthSuccess = (authData) => {
    setToken(authData.access_token);
    setCurrentUser(authData.user);
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthModalOpen(true);
    setAuthMode('login');
  };

  const renderTabContent = () => {
    if (!currentUser) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>请先登录</h2>
          <p>您需要登录后才能使用此功能</p>
          <button 
            onClick={() => {
              setIsAuthModalOpen(true);
              setAuthMode('login');
            }}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            点击登录
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'translate':
        return <Translate token={token} />;
      case 'writing':
        return <Writing token={token} />;
      case 'review':
        return <Review token={token} />;
      case 'stats':
        return <Stats token={token} />;
      default:
        return <Translate token={token} />;
    }
  };

  return (
    <div>
      <header style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>英语学习应用</h1>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>欢迎, {currentUser.username}!</span>
            <button 
              onClick={handleLogout}
              style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              退出登录
            </button>
          </div>
        ) : (
          <div>
            <button 
              onClick={() => {
                setIsAuthModalOpen(true);
                setAuthMode('login');
              }}
              style={{ marginRight: '8px', padding: '6px 12px' }}
            >
              登录
            </button>
            <button 
              onClick={() => {
                setIsAuthModalOpen(true);
                setAuthMode('register');
              }}
              style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              注册
            </button>
          </div>
        )}
      </header>

      {currentUser && (
        <nav style={{ 
          backgroundColor: '#fff', 
          padding: '0 16px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setActiveTab('translate')}
              style={{ 
                padding: '12px 16px', 
                border: 'none', 
                background: activeTab === 'translate' ? '#007bff' : 'transparent',
                color: activeTab === 'translate' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              翻译
            </button>
            <button
              onClick={() => setActiveTab('writing')}
              style={{ 
                padding: '12px 16px', 
                border: 'none', 
                background: activeTab === 'writing' ? '#007bff' : 'transparent',
                color: activeTab === 'writing' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              写作
            </button>
            <button
              onClick={() => setActiveTab('review')}
              style={{ 
                padding: '12px 16px', 
                border: 'none', 
                background: activeTab === 'review' ? '#007bff' : 'transparent',
                color: activeTab === 'review' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              复习
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              style={{ 
                padding: '12px 16px', 
                border: 'none', 
                background: activeTab === 'stats' ? '#007bff' : 'transparent',
                color: activeTab === 'stats' ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              统计
            </button>
          </div>
        </nav>
      )}

      <main style={{ padding: '16px' }}>
        {renderTabContent()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
