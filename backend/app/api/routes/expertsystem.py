from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import pandas as pd
import datetime

router = APIRouter()

# Define the base directory paths
classimDir = os.getenv("CLASSIM_DIR", "./classim")
runDir = os.path.join(classimDir, 'run')
storeDir = os.path.join(runDir, 'store')
tempDirs = [os.path.join(runDir, f'temp{i}') for i in range(4)]

# Ensure directories exist
for tempDir in tempDirs:
    os.makedirs(tempDir, exist_ok=True)

# Define models for request and response
class SimulationRequest(BaseModel):
    simulation_id: int
    crop: str
    experiment: str
    treatment: str
    in_season_irr: List[int]

class SimulationResponse(BaseModel):
    simulation_id: int
    yields: List[float]

@router.post("/run-simulation", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest):
    try:
        # Prepare directories and files
        simulation_names = [f"{request.simulation_id + i}" for i in range(4)]
        for tempDir in tempDirs:
            for file in os.listdir(tempDir):
                file_path = os.path.join(tempDir, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)

        # Example logic for running simulations (replace with actual logic)
        yields = []
        for i, sim_name in enumerate(simulation_names):
            # Simulate yield calculation (replace with actual simulation logic)
            yield_value = 1000 + (i * 100)  # Dummy yield value
            yields.append(yield_value)

        return SimulationResponse(simulation_id=request.simulation_id, yields=yields)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-simulation/{simulation_id}", response_model=SimulationResponse)
def fetch_simulation(simulation_id: int):
    try:
        # Example logic to fetch simulation data (replace with actual logic)
        yields = [1000, 1100, 1200, 1300]  # Dummy data
        return SimulationResponse(simulation_id=simulation_id, yields=yields)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))