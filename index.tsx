/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Ensure CSS is imported for Vite build
import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}