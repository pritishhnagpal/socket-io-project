import "./App.css";
import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import QuestionWindow from "./components/QuestionWindow";
import SignUp from "./components/Signup";
import Login from "./components/Login";

const socket = io("https://poll-service-wc5d.onrender.com/");

function App() {
  const [channels, setChannels] = useState([]);

  const ROUTES = [
    {
      path: "/",
      exact: true,
      element: <Login socket={socket} setChannels={setChannels} />,
    },
    {
      path: "/teacher",
      exact: true,
      element: <TeacherDashboard socket={socket} />,
    },
    {
      path: "/student",
      element: (
        <StudentDashboard
          socket={socket}
          channels={channels}
          setChannels={setChannels}
        />
      ),
    },

    {
      path: "/question-window",
      element: <QuestionWindow socket={socket} />,
    },
    {
      path: "/signup",
      element: <SignUp socket={socket} />,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {ROUTES.map((route) => (
          <Route {...route} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
