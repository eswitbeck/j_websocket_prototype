import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App'

const rNode = document.createElement('div');
rNode.setAttribute('id', 'root');
document.querySelector('body').appendChild(rNode);
const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);
