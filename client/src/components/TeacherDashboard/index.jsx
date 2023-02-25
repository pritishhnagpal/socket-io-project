import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import Cookies from "universal-cookie";
import { Input, Button, Radio, InputNumber } from "antd";
import styles from "../Login/login.module.css";
import teacherDashboardStyles from "./TeacherDashboard.module.css";
import { customApi } from "../../utils/index";

const { TextArea } = Input;
export default function TeacherDashboard({ socket }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [students, setStudents] = useState([]);
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState({});
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const [disableBtn, setDisableBtn] = useState(false);
  const [result, setResult] = useState([]);
  console.log("tlll", timeLimit);
  const cookies = new Cookies();
  const token = cookies.get("token");
  function handleAddOption() {
    setOptions([...options, ""]);
  }
  async function fetchHistory() {
    const { data } = await customApi({
      endpoint: "get-previous-polls",
      headers: {
        Authorization: `Bearer ${cookies.get("token")}`,
      },
    });

    setHistory(data);
  }

  function sendMessage() {
    const payload = {
      channelId: sessionStorage.getItem("channelId"),
      message,
      id: selected.id,
    };
    socket.emit("send-chat", payload);
    setMessage("");
  }

  useEffect(() => {
    let payload;
    console.log("cid", sessionStorage.getItem("channelId"));
    if (sessionStorage.getItem("channelId")) {
      payload = {
        channelId: sessionStorage.getItem("channelId"),
        token: cookies.get("token"),
      };
    } else {
      const channelId = nanoid(6);
      payload = { channelId, token };
      sessionStorage.setItem("channelId", channelId);
    }
    socket.emit("create-room", payload);
    getAllStudents();
    socket.on("update-student-list", ({ students }) => {
      console.log("st", students, socket.id);
      setStudents(students);
    });
    socket.on("result", (payload) => {
      const { responses, total } = payload;
      setResult(responses.map((val) => ((val / total) * 100).toPrecision(4)));
    });
    socket.on("chat", ({ chats, id }) => {
      const chatCopy = { ...chat };
      chatCopy[id] = chats;
      console.log("sel", chatCopy);
      setChat(chatCopy);
    });
  }, [socket]);

  function getAllStudents() {
    socket.emit(
      "get-all-students-in-channel",
      sessionStorage.getItem("channelId"),
      ({ students }) => {
        setStudents(students);
      }
    );
  }

  function handleOptions(e, index) {
    const optionsCopy = [...options];
    optionsCopy[index] = e.target.value;
    setOptions(optionsCopy);
  }

  function handleAskQuestion() {
    const allOptionsPresent = options.reduce(
      (acc, option) => option.trim().length > 0 && acc,
      true
    );
    if (allOptionsPresent) {
      setDisableBtn(true);
      socket.emit("question", {
        question,
        options,
        correctOption,
        channelId: sessionStorage.getItem("channelId"),
        token,
        timeLimit,
      });
      setTimeLeft(timeLimit);
    }
  }

  function handleKickStudent(id) {
    socket.emit("kick-student", {
      id,
      channelId: sessionStorage.getItem("channelId"),
    });
    getAllStudents();
  }

  console.log("stud", students);

  useEffect(() => {
    let id;

    if (timeLeft > 0) {
      id = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      if (question.length > 0) {
        socket.emit("record-result", {
          question,
          options,
          correctOption,
          result,
          channelId: sessionStorage.getItem("channelId"),
          token,
        });
      }
      setDisableBtn(false);
    }

    return () => clearInterval(id);
  }, [timeLeft]);

  return (
    <>
      <div className={teacherDashboardStyles.container}>
        <div
          disabled={disableBtn}
          style={{ border: "1px solid black", padding: 20 }}
        >
          <h1>Ask Question</h1>
          <TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter Question"
            className={styles.input}
          />
          {options.map((option, index) => {
            const { value } = option;
            return (
              <div className={teacherDashboardStyles.box}>
                <Input
                  value={value}
                  placeholder="Enter Option"
                  onChange={(e) => handleOptions(e, index)}
                  className={styles.input}
                />
                <Radio
                  type="radio"
                  checked={correctOption === index}
                  onClick={() => setCorrectOption(index)}
                  className={styles.input}
                  disabled={disableBtn}
                />
                {result.length === 4 && (
                  <div className={teacherDashboardStyles.percent}>
                    {+result[index]}%
                  </div>
                )}
              </div>
            );
          })}
          <Button
            onClick={handleAddOption}
            disabled={disableBtn}
            className={styles.btn}
          >
            Add another option
          </Button>
          <div className={teacherDashboardStyles.limit}>
            <span>Time Limit: </span>
            <InputNumber
              placeholder="time"
              onChange={(number) => setTimeLimit(number)}
              value={timeLimit}
              disabled={disableBtn}
              className={teacherDashboardStyles.time}
            />
          </div>
          <Button
            onClick={handleAskQuestion}
            disabled={disableBtn}
            type="primary"
            className={styles.btn}
          >
            Ask Question
          </Button>
        </div>
        <div style={{ border: "1px solid black", padding: 20, minWidth: 300 }}>
          <h1>Students Online</h1>
          <h4>Click on name to open chat window</h4>
          <h4></h4>
          {students?.map(({ id, userName }) => (
            <div>
              <div
                className={teacherDashboardStyles.student}
                onClick={() => setSelected({ id, userName })}
              >
                {userName}
              </div>
              <Button
                style={{ marginBottom: 20 }}
                onClick={() => handleKickStudent(id)}
              >
                Kick Student
              </Button>
            </div>
          ))}
        </div>
        {selected?.id ? (
          <div className={teacherDashboardStyles.chat}>
            <h1>Chat With {selected.userName}</h1>
            {chat[selected.id]?.map((cht) => (
              <div>{cht}</div>
            ))}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        ) : null}
      </div>
      <Button onClick={fetchHistory}>Previous History</Button>
      {history?.length
        ? history.map((his) => {
            const { participants, questions } = his;
            return (
              <div>
                {questions.map(({ question, result, options }) => (
                  <>
                    <div>Ques: {question}</div>
                    <div>No. of participants: {participants.length}</div>
                    {options?.map((option, index) => (
                      <div>
                        {option} - {result[index]}%
                      </div>
                    ))}
                  </>
                ))}
              </div>
            );
          })
        : null}
    </>
  );
}
