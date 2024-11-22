import React, { useState, useRef, useEffect } from 'react';
import { Bell, GripHorizontal } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationPrompt() {
  const { permission, requestPermission } = useNotifications();
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const promptRef = useRef<HTMLDivElement>(null);

  // Initialize position on first render
  useEffect(() => {
    if (position.x === -1 && position.y === -1) {
      setPosition({
        x: window.innerWidth - (promptRef.current?.offsetWidth || 0) - 24,
        y: window.innerHeight - (promptRef.current?.offsetHeight || 0) - 24
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (promptRef.current) {
      const rect = promptRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, 
        window.innerWidth - (promptRef.current?.offsetWidth || 0)));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, 
        window.innerHeight - (promptRef.current?.offsetHeight || 0)));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (permission === 'granted' || !('Notification' in window)) {
    return null;
  }

  return (
    <div
      ref={promptRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className={`max-w-sm z-50 ${isDragging ? 'select-none' : ''}`}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 
        transform transition-all duration-300 ease-in-out 
        hover:shadow-2xl">
        <div 
          className="absolute top-2 left-0 right-0 flex justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        
        <div className="flex items-start space-x-4 mt-4">
          <div className="flex-shrink-0 bg-indigo-50 rounded-full p-3 
            transition-colors duration-300 group-hover:bg-indigo-100">
            <Bell className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Enable Notifications
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Get timely reminders for your medications and never miss a dose.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={requestPermission}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 
                  border border-transparent text-sm font-medium rounded-lg 
                  text-white bg-indigo-600 hover:bg-indigo-700 
                  transform transition-all duration-200 
                  hover:shadow-md hover:-translate-y-0.5 
                  active:translate-y-0 active:shadow-none
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </button>
              <button
                onClick={() => {
                  const prompt = document.querySelector('.notification-prompt');
                  prompt?.classList.add('animate-slide-out');
                  setTimeout(() => {
                    prompt?.remove();
                  }, 300);
                }}
                className="inline-flex items-center justify-center p-2.5 
                  border border-gray-200 text-sm font-medium rounded-lg 
                  text-gray-600 bg-white hover:bg-gray-50
                  transform transition-all duration-200 
                  hover:shadow-md hover:-translate-y-0.5 
                  active:translate-y-0 active:shadow-none
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}