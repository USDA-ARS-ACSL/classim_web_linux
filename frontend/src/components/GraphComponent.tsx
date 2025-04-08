import React, { useState, useEffect } from "react";
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
    simulationID: number; // simulationID is explicitly typed as a number
}

const GraphComponent: React.FC<GraphComponentProps> = ({ simulationID }) => {
    const [data, setData] = useState<DataPoint[]>([]);

    useEffect(() => {
        // Use simulationID in the URL
        const eventSource = new EventSource(`${OpenAPI.BASE}/api/v1/seasonalsim/simulationResp/${simulationID}`);
        
        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const newPoint = JSON.parse(event.data);

                if (
                    typeof newPoint.SoilT === "number" &&
                    typeof newPoint.SolRad === "number" &&
                    typeof newPoint.TotLeafDM === "number" &&
                    typeof newPoint.ETdmd === "number" &&
                    typeof newPoint.shaded_LAI === "number"
                ) {
                    const xValue = data.length > 0 ? data[data.length - 1].x + 1 : 0; // Increment x value dynamically
                    const pointWithX = { ...newPoint, x: xValue };

                    setData((prevData) => [...prevData, pointWithX].slice(-3000)); // Keep only the last 3000 records
                } else {
                    console.error("Invalid Data Structure:", newPoint);
                }
            } catch (error) {
                console.error("Error Parsing SSE Data:", error, event.data);
            }
        };

        eventSource.onerror = () => {
            console.error("Error connecting to SSE stream");
            eventSource.close();
        };

        return () => eventSource.close();
    }, [simulationID]);

    if (data.length === 0) {
        return <p>Waiting for data...</p>;
    }

    // Helper function to generate Highcharts options for a given column
    const generateChartOptions = (dataKey: keyof DataPoint) => ({
        chart: {
            type: 'line',
            height: 180,
            animation: false,
          },
          title: {
            text: dataKey,
          },
          xAxis: {
            // min: 0,
            max: 3000,
            title: false,
          },
          yAxis: {
            title: false,
          },
          plotOptions: {
            series: {
              lineWidth: 1,
            },
          },
          series: [
            {
                name: dataKey,
                data: data.map((point) => point[dataKey]), // Map the data for the specific key
            },
        ],
          legend: {
            enabled: false,
          },
    });

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                {/* Graph 1: SoilT */}
                <div style={{ border: "2px solid black", padding: "10px" }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={generateChartOptions("SoilT")}
                    />
                </div>

                {/* Graph 2: SolRad */}
                <div style={{ border: "2px solid black", padding: "10px" }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={generateChartOptions( "SolRad")}
                    />
                </div>

                {/* Graph 3: TotLeafDM */}
                <div style={{ border: "2px solid black", padding: "10px" }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={generateChartOptions("TotLeafDM")}
                    />
                </div>

                {/* Graph 4: ETdmd */}
                <div style={{ border: "2px solid black", padding: "10px" }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={generateChartOptions("ETdmd")}
                    />
                </div>

                {/* Graph 5: shaded_LAI */}
                <div style={{ border: "2px solid black", padding: "10px" }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={generateChartOptions("shaded_LAI")}
                    />
                </div>
            </div>
        </div>
    );
};

export default GraphComponent;
