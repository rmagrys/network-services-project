import { defaults } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import io from "socket.io-client";
import { config } from "../config";

const { SOCKET_URL } = config;
const socket = io.connect(SOCKET_URL);

socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

function LineChart({ name, type }) {
  const [chartData, setChartData] = React.useState([]);

  React.useLayoutEffect(() => {
    socket.on(type, (incomingData) => {
      setChartData((data) => {
        if (data.length > 20) {
          data.shift();
        }
        return [...data, incomingData.value];
      });
    });
  }, [socket, type]);

  const data = {
    type: "line",
    labels: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
    ],
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Line Chart",
        },
      },
    },
    datasets: [
      {
        label: `${name} dataset`,
        data: chartData,

        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };
  return (
    <div>
      <h1>{name} Line Chart</h1>
      <div style={{ width: "500px", margin: "0 auto" }}>
        <Line data={data} />
      </div>
    </div>
  );
}

React.memo(LineChart);

export default LineChart;
