import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="">
      <Link to="/student"> I am a Student</Link>
      <Link to="/teacher"> I am a Teacher</Link>
    </div>
  );
}
