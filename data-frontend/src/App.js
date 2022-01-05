import React, { useEffect, useLayoutEffect, useReducer, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import LineChart from "./components/LineChart";
import { Line } from "react-chartjs-2";
import { config } from "./config";

const { TEMPERATURE, HUMIDITY, PRESSURE } = config;

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <LineChart type={TEMPERATURE} name={"Temperature"} />
      <LineChart type={HUMIDITY} name={"Humidity"} />
      <LineChart type={PRESSURE} name={"Pressure"} />
    </div>
  );
}

export default App;
