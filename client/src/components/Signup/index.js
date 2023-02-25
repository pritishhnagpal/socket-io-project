import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { customApi } from "../../utils";
// import styles from "./signup.module.css";
import styles from "../Login/login.module.css";
import { Input, Button, Dropdown } from "antd";

const ROLES = [
  {
    label: "Teacher",
    key: 1,
    value: "teacher",
  },
  {
    label: "Student",
    key: 2,
    value: "student",
  },
];

export default function SignUp({ socket }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(1);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSignUp() {
    const body = {
      name,
      email,
      role: ROLES[role].value,
      password,
    };
    const { redirect, message } = await customApi({
      endpoint: "signup",
      body,
      method: "POST",
    });
    navigate(redirect);
    console.log("msg", message);
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.heading}>SignUp</h1>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <div class={styles.dropdown}>
          <span>Role: </span>
          <Dropdown.Button
            placeholder="Role"
            value={role}
            menu={{
              items: ROLES,
              selectedKeys: [ROLES[0]],
              onClick: (item) => setRole(item.key - 1),
            }}
            type="primary"
          >
            {ROLES[role].label}
          </Dropdown.Button>
        </div>
        <Input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <Button type="primary" onClick={handleSignUp} className={styles.btn}>
          SignUp
        </Button>
        <div className={styles.bottom}>
          <span>Already have an account?</span>
          <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}
