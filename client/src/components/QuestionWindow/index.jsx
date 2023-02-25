import { Button, Input, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import styles from "./QuestionWindow.module.css";

export default function QuestionWindow({ socket }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [timeLimit, setTimeLimit] = useState(0);
  const [result, setResult] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [disable, setDisable] = useState(false);
  const [err, setErr] = useState("");
  // const navigate = useNavigate();
  const cookies = new Cookies();

  function sendMessage() {
    const payload = {
      channelId: sessionStorage.getItem("channelId"),
      message,
      id: socket.id,
    };
    socket.emit("send-chat", payload);
    setMessage("");
  }

  function handleSubmit() {
    socket.emit("question-response", {
      selectedOption,
      channelId: sessionStorage.getItem("channelId"),
      token: cookies.get("token"),
    });
    setDisable(true);
    // navigate("/question-window");
  }
  console.log("ssss", socket);

  useEffect(() => {
    socket.on("get-question", (payload) => {
      const { question, options, correctOption, timeLimit } = payload;
      console.log("ques", question, options);
      console.log("tl", timeLimit);
      setQuestion(question);
      setOptions(options);
      setTimeLimit(timeLimit);
      setDisable(false);
    });

    socket.on("kicked", ({ message }) => {
      setErr(message);
    });

    socket.on("result", (payload) => {
      const { responses, total } = payload;
      setResult(responses.map((val) => (+(val / total) * 100).toPrecision(4)));
    });

    socket.on("chat", ({ chats }) => {
      setChat(chats);
    });
  }, [socket]);

  useEffect(() => {
    let id;
    if (timeLimit > 0) {
      id = setInterval(() => {
        setTimeLimit(timeLimit - 1);
      }, 1000);
    } else {
      // setQuestion("");
      // setOptions([]);
    }

    return () => clearInterval(id);
  }, [timeLimit]);

  return (
    <>
      {!err.length ? (
        <div className={styles.container}>
          <div>
            {(timeLimit === 0 && question.length) || disable ? (
              <h1>Waiting for teacher to ask question</h1>
            ) : null}
            {question ? (
              <div className={styles.top}>
                <div className={styles.qBox}>
                  <h1 className={styles.ques}>Question: {question}</h1>
                  {options.map((option, index) => (
                    <div className={styles.box}>
                      <div className={styles.option}>{option}</div>
                      <Radio
                        type="radio"
                        checked={selectedOption === index}
                        onClick={() => setSelectedOption(index)}
                        style={{ display: timeLimit === 0 ? "none" : "" }}
                        disabled={disable}
                      />
                      {disable || timeLimit === 0 ? (
                        <div>{result[index]}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <h1>Time Left: {timeLimit}</h1>
              </div>
            ) : (
              <h1>Waiting for teacher to ask question</h1>
            )}
            {timeLimit > 0 ? (
              <Button onClick={handleSubmit} disabled={disable}>
                Submit Answer
              </Button>
            ) : null}
          </div>
          <div className={styles.chat}>
            <h1>Chat</h1>
            {chat.map((cht) => (
              <div>{cht}</div>
            ))}
            <Input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      ) : (
        err
      )}
    </>
  );
}
