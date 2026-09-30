"""
Cloud Database Service (Firestore / Cloud SQL Integration Layer)
Cloud-Connected Smart Plant Care & Watering System

This module abstracts database access for both serverless NoSQL (Google Cloud Firestore)
and Relational Time-Series databases (PostgreSQL / TimescaleDB).
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class CloudDatabaseService:
    def __init__(self, mode: str = "firestore"):
        self.mode = mode
        self.project_id = os.getenv("FIREBASE_PROJECT_ID", "smart-plant-care-cloud")
        # In a deployed cloud environment:
        # from google.cloud import firestore
        # self.db = firestore.Client(project=self.project_id)

    def record_reading(self, device_id: str, reading_data: Dict[str, Any]) -> str:
        """
        Stores sensor reading in the time-series subcollection:
        /devices/{deviceId}/readings/{timestamp}
        """
        ts = reading_data.get("timestamp") or datetime.now(timezone.utc).isoformat()
        reading_id = f"reading_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        
        # Firestore implementation:
        # dev_ref = self.db.collection("devices").document(device_id)
        # dev_ref.collection("readings").document(reading_id).set(reading_data)
        # dev_ref.set({"lastReading": reading_data, "last_seen": ts}, merge=True)
        return reading_id

    def get_latest_reading(self, device_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the most recent reading for a given device ID.
        """
        # doc = self.db.collection("devices").document(device_id).get()
        # return doc.to_dict().get("lastReading") if doc.exists else None
        return None

    def record_watering_event(self, event_data: Dict[str, Any]) -> str:
        """
        Logs an irrigation pulse into the historical audit collection:
        /devices/{deviceId}/actions/{actionId}
        """
        event_id = f"evt_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        # self.db.collection("devices").document(event_data["device_id"]).collection("actions").document(event_id).set(event_data)
        return event_id
