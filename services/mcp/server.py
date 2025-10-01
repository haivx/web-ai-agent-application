"""FastAPI skeleton for the Model Control Plane (MCP).

This service will orchestrate clustering jobs and manage embeddings in future sprints.
"""

from fastapi import FastAPI

app = FastAPI(title="Photo Organizer MCP")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    """Simple health endpoint used by docker health checks."""
    # TODO: Replace with application-aware health information.
    return {"status": "ok"}


@app.post("/cluster")
def create_cluster_job() -> dict[str, str]:
    """Placeholder endpoint for creating clustering jobs."""
    # TODO: Integrate with the actual clustering pipeline.
    return {"message": "TODO: implement clustering job creation"}
