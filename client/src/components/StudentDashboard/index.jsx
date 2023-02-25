import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import styles from "./StudentDashboard.module.css";
import loginStyles from "../Login/login.module.css";

export default function StudentDashboard({ socket, channels, setChannels }) {
  const navigate = useNavigate();
  const cookies = new Cookies();
  function handleJoinChannel(channelId) {
    socket.emit("join-channel", {
      userName: cookies.get("userName"),
      channelId,
      token: cookies.get("token"),
    });
    sessionStorage.setItem("channelId", channelId);
    navigate("/question-window");
  }

  useEffect(() => {
    socket.on("new-channel", (channels) => setChannels(channels));
  }, []);

  return (
    <div className={loginStyles.container} style={{ flexFlow: "column" }}>
      {channels.length > 0 ? <h1> Available Channels</h1> : null}
      <div className={styles.container}>
        {channels.length > 0 ? (
          channels.map(({ channelId }) => (
            <div>
              <span>{channelId}</span>
              <Button onClick={() => handleJoinChannel(channelId)}>Join</Button>
            </div>
          ))
        ) : (
          <h1>No Channel Available</h1>
        )}
      </div>
    </div>
  );
}
