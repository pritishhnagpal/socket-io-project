import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { customApi } from "../../utils";
import Cookies from "universal-cookie";
import { Input, Button } from "antd";
import styles from "./login.module.css";

export default function Login({ socket, setChannels }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const cookies = new Cookies();

  async function handleLogin() {
    const body = {
      email,
      password,
    };

    const { redirect, token, user } = await customApi({
      endpoint: "login",
      body,
      method: "POST",
    });
    cookies.set("token", token, { path: "/" });

    if (user.role === "student") {
      cookies.set("userName", user.name, { path: "/" });
      socket.emit("get-all-channels", ({ channels }) => {
        setChannels(channels);
      });
    }
    navigate(redirect);
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.heading}>LOGIN</h1>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <Input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <Button type="primary" onClick={handleLogin} className={styles.btn}>
          Login
        </Button>
        <div className={styles.bottom}>
          <span>Don't have an account?</span>
          <Link to="/signup">Signup</Link>
        </div>
      </div>
    </div>
  );
}
