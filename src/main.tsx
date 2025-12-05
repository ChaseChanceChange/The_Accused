import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  
  // Detect if we are running in the Discord Activity context
  // Logic: If filename is activity.html OR we are in an iframe with Discord params
  const isActivity = window.location.pathname.includes('activity.html') || 
                     window.location.search.includes('frame_id');

  console.log(`🔮 Mystic Enchant Creator initializing... Mode: ${isActivity ? 'DISCORD ACTIVITY' : 'WEB'}`);

  root.render(<App isActivityContext={isActivity} />);
}