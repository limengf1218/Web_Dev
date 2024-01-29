import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TopLogo } from './TopLogo';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // 监听页面滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 10); // 在滚动距离超过 10px 时显示按钮
    };

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    return () => {
      // 在组件卸载时移除滚动事件监听器
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 平滑滚动到顶部
      }}
      className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
      style={{ position: 'fixed', bottom: '100px', right: '10px', opacity: 0.7 }}
    >
      <TopLogo />
    </div>
  );
};
