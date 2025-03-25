import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DataPoint {
    x: number;
    y: number;
}

interface GraphComponentProps {
    simulationID: number; // simulationID is explicitly typed as a number
}

const GraphComponent: React.FC<GraphComponentProps> = ({ simulationID }) => {
    const [data, setData] = useState<DataPoint[]>([]);

    useEffect(() => {
        // Use simulationID in the URL
        const eventSource = new EventSource(`http://localhost/api/v1/seasonalsim/simulationResp/${simulationID}`);
        
        eventSource.onmessage = (event: MessageEvent) => {

            try {
                const newPoint: DataPoint = JSON.parse(event.data);

                if (typeof newPoint.x === "number" && typeof newPoint.y === "number") {
                    setData((prevData) => [...prevData, newPoint]);
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
    }, [simulationID]); // Add simulationID as a dependency

    if (data.length === 0) {
        return <p>Waiting for data...</p>;
    }

    return (
        <div>
            <h2>LEI vs Jday</h2>
            <LineChart width={800} height={400} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" />  {/* Ensure X-axis works */}
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
        </div>
    );
};

export default GraphComponent;
