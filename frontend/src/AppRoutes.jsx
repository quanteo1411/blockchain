import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History';
import Admin from './pages/Admin';

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Admin />} />
    </Routes>
);

export default AppRoutes;``