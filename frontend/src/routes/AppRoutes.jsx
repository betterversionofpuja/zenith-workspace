import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import Home from '../screens/Home.jsx';
import Login from '../screens/Login.jsx';
import Register from '../screens/Register.jsx';
import Project from '../screens/Project.jsx';
import Profile from '../screens/Profile.jsx';

function Approutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/project/:projectId" element={<Project />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Approutes;
