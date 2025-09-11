import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { OpenAPI } from "../../../client";
import { useToast } from "@chakra-ui/react";

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

// Add display names and units for each crop key
const cropKeyMeta: Record<string, Record<string, { name: string; unit: string }>> = {
  maize: {
    SoilT: { name: "Soil Temperature", unit: "°C" },
    SolRad: { name: "Solar Radiation", unit: "MJ/m²" },
    TotLeafDM: { name: "Total Leaf Dry Matter", unit: "kg/ha" },
    ETdmd: { name: "Evapotranspiration Demand", unit: "mm" },
  },
  soybean: {
    LAI: { name: "Leaf Area Index", unit: "" },
    totalDM: { name: "Total Dry Matter", unit: "kg/ha" },
    podDM: { name: "Pod Dry Matter", unit: "kg/ha" },
    Tr_act: { name: "Actual Transpiration", unit: "mm" },
  },
  potato: {
    LAI: { name: "Leaf Area Index", unit: "" },
    totalDM: { name: "Total Dry Matter", unit: "kg/ha" },
    tuberDM: { name: "Tuber Dry Matter", unit: "kg/ha" },
    "Tr-Pot": { name: "Transpiration - Potato", unit: "mm" },
  },
  cotton: {
    LAI: { name: "Leaf Area Index", unit: "" },
    PlantDM: { name: "Plant Dry Matter", unit: "kg/ha" },
    Yield: { name: "Yield", unit: "kg/ha" },
    Nodes: { name: "Nodes", unit: "" },
  },
};

const GraphComponent: React.FC<GraphComponentProps> = ({ simulationID, crop }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const xRef = useRef<number>(0);
  const toast = useToast();

  useEffect(() => {
    const eventSource = new EventSource(
      `${OpenAPI.BASE}/api/v1/seasonalsim/simulationResp/${simulationID}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection established.");
    };

    eventSource.onmessage = (event: MessageEvent) => {
      // Handle run_completed event
      if (event.data === "run_completed") {
        toast({
          title: "Simulation Completed",
          description: "The simulation has finished successfully.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        eventSource.close();
        return;
      }
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
  }, [simulationID, crop, toast]);

  if (data.length === 0) {
    return <p>Waiting for data...</p>;
  }

  const keysToPlot = cropKeys[crop] || Object.keys(data[0] || {});

  const generateChartOptions = (key: string) => {
    const meta = cropKeyMeta[crop]?.[key] || { name: key, unit: "" };
    return {
      chart: {
        type: "line",
        height: 180,
        animation: false,
      },
      title: {
        text: meta.unit ? `${meta.name} (${meta.unit})` : meta.name,
      },
      xAxis: {
        title: { text: "Time (days)" }, // Change as needed
        max: MAX_POINTS,
      },
      yAxis: {
        title: { text: meta.unit ? `${meta.name} (${meta.unit})` : meta.name },
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
          name: meta.name,
          data: data.map((point) => [point.x, point[key]]),
        },
      ],
      legend: {
        enabled: false,
      },
    };
  };

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