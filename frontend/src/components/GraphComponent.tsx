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
  shaded_LAI: number;
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
  
        const values = JSON.parse(line.replace("data:", "").trim())
      .map((v: any) => (typeof v === "string" ? v.trim() : v));
          // Map the data to the required fields
          const newPoint: DataPoint = {
            x: xRef.current++, // Increment x to track time
            SoilT: parseFloat(values[13]), // Assuming "SoilT" is at index 13
            SolRad: parseFloat(values[12]), // Assuming "SolRad" is at index 12
            TotLeafDM: parseFloat(values[44]), // Assuming "TotLeafDM" is at index 42
            ETdmd: parseFloat(values[16]), // Assuming "ETdmd" is at index 16
            shaded_LAI: parseFloat(values[23]), // Assuming "shaded_LAI" is at index 23
          };

          // Validate the numeric values before adding to the chart
          if (Object.values(newPoint).every((val) => !isNaN(val))) {
            setData((prev) => [...prev, newPoint].slice(-MAX_POINTS)); // Keep only the latest MAX_POINTS
          } else {
            console.warn("Invalid numeric data:", newPoint);
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
      {["SoilT", "SolRad", "TotLeafDM", "ETdmd", "shaded_LAI"].map((key) => (
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
