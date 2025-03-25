from typing import Any
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import pandas as pd
import os
import json

router = APIRouter()

# Define the correct path to the CSV file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "assets", "large_dataset.csv")

async def event_stream():
    df = pd.read_csv(CSV_PATH)
    for index, row in df.iterrows():
        data =json.dumps({"x": int(index), "y": float(row["value_column"])})
        value = row["value_column"]

        # Skip rows where value is NaN or empty
        if pd.isna(value) or value == "":
            break
        yield f"data: {data} \n\n"
        await asyncio.sleep(0.1)
    

@router.get("/")
def get_sse() -> Any:
    return StreamingResponse(event_stream(), media_type="text/event-stream")
