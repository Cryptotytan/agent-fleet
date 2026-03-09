import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Agents from './pages/Agents'
import Transactions from './pages/Transactions'
import Volume from './pages/Volume'
import Skills from './pages/Skills'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout currentPageName="Agents"><Agents /></Layout>} />
      <Route path="/agents" element={<Layout currentPageName="Agents"><Agents /></Layout>} />
      <Route path="/transactions" element={<Layout currentPageName="Transactions"><Transactions /></Layout>} />
      <Route path="/volume" element={<Layout currentPageName="Volume"><Volume /></Layout>} />
      <Route path="/skills" element={<Layout currentPageName="Skills"><Skills /></Layout>} />
    </Routes>
  </BrowserRouter>
)
