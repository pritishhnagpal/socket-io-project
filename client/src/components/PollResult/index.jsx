import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PollResult() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  function handleSubmit() {
    navigate("/question-window");
  }

  return (
    <div className="">
      theek hai
      <div>okok</div>
    </div>
  );
}
