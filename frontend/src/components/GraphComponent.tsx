import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { OpenAPI } from "../client";

interface DataPoint {
  x: number;
  SoilT: number;
  SolRad: number;
  TotLeafDM: number;
  ETdmd: number;
}

interface GraphComponentProps {
  simulationID: number;
}

const MAX_POINTS = 3000;

const GraphComponent: React.FC<GraphComponentProps> = ({ simulationID }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const xRef = useRef<number>(0); // Track x without re-rendering

  useEffect(() => {
    console.log("Initializing SSE connection..."); // Debug log

    const eventSource = new EventSource(
      `${OpenAPI.BASE}/api/v1/seasonalsim/simulationResp/${simulationID}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection established."); // Log when connection is open
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const line = event.data.trim();
        const obj = JSON.parse(line.replace("data:", "").trim());
        const newPoint: DataPoint = {
          x: xRef.current++,
          SoilT: parseFloat(obj.SoilT),
          SolRad: parseFloat(obj.SolRad),
          TotLeafDM: parseFloat(obj.TotLeafDM),
          ETdmd: parseFloat(obj.ETdmd),
        };
        if (Object.values(newPoint).every((val) => !isNaN(val))) {
          setData((prev) => [...prev, newPoint].slice(-MAX_POINTS));
        }
      } catch (err) {
        console.error("Error processing event data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    // Cleanup on component unmount
    return () => {
      console.log("Closing SSE connection..."); // Log cleanup
      eventSource.close();
    };
  }, [simulationID]);

  if (data.length === 0) {
    return <p>Waiting for data...</p>;
  }

  // Function to generate chart options dynamically
  const generateChartOptions = (key: keyof DataPoint) => ({
    chart: {
      type: "line",
      height: 180,
      animation: false,
    },
    title: {
      text: key,
    },
    xAxis: {
      title: { text: "Time" },
      max: MAX_POINTS,
    },
    yAxis: {
      title: { text: key },
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        lineWidth: 1,
        animation: false,
      },
    },
    series: [
      {
        name: key,
        data: data.map((point) => [point.x, point[key]]),
      },
    ],
    legend: {
      enabled: false,
    },
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
      {["SoilT", "SolRad", "TotLeafDM", "ETdmd"].map((key) => (
        <div key={key} style={{ border: "2px solid black", padding: "10px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={generateChartOptions(key as keyof DataPoint)}
          />
        </div>
      ))}
    </div>
  );
};

export default GraphComponent;
