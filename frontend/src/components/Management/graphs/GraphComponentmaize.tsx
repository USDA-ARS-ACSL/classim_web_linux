import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { OpenAPI } from "../../../client";

interface DataPoint {
  x: number;
  [key: string]: number; // Allow dynamic keys for different crops
}

interface GraphComponentProps {
  simulationID: number;
  crop: string;
}

const MAX_POINTS = 3000;

// Crop-specific keys to plot
const cropKeys: Record<string, string[]> = {
  maize: ["SoilT", "SolRad", "TotLeafDM", "ETdmd"],
  soybean: ["LAI", "totalDM", "podDM", "Tr_act"],
  potato: ["LAI", "totalDM", "tuberDM", "Tr-Pot"],
  cotton: ["LAI", "PlantDM", "Yield", "Nodes"],
};

const GraphComponent: React.FC<GraphComponentProps> = ({ simulationID, crop }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const xRef = useRef<number>(0);

  useEffect(() => {
    const eventSource = new EventSource(
      `${OpenAPI.BASE}/api/v1/seasonalsim/simulationResp/${simulationID}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection established.");
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const line = event.data.trim();
        const obj = JSON.parse(line.replace("data:", "").trim());
        const keys = cropKeys[crop] || Object.keys(obj);
        const newPoint: DataPoint = { x: xRef.current++ };
        let valid = true;
        keys.forEach((key) => {
          const val = parseFloat(obj[key]);
          if (isNaN(val)) valid = false;
          newPoint[key] = val;
        });
        if (valid) {
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

    return () => {
      console.log("Closing SSE connection...");
      eventSource.close();
    };
  }, [simulationID, crop]);

  if (data.length === 0) {
    return <p>Waiting for data...</p>;
  }

  const keysToPlot = cropKeys[crop] || Object.keys(data[0] || {});

  const generateChartOptions = (key: string) => ({
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
      {keysToPlot.map((key) => (
        <div key={key} style={{ border: "2px solid black", padding: "10px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={generateChartOptions(key)}
          />
        </div>
      ))}
    </div>
  );
};

export default GraphComponent;