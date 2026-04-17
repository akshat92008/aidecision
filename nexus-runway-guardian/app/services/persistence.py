"""
app/services/persistence.py
Lightweight thread-safe in-memory store for simulation results.
"""

from threading import Lock
from typing import Dict, Any, Optional

class SimulationStore:
    def __init__(self):
        self._data: Dict[str, Any] = {}
        self._lock = Lock()

    def store_result(self, result_id: str, data: Any):
        with self._lock:
            self._data[result_id] = data

    def get_result(self, result_id: str) -> Optional[Any]:
        with self._lock:
            return self._data.get(result_id)

    def list_results(self):
        with self._lock:
            return list(self._data.keys())

# Shared singleton for the app
store = SimulationStore()
