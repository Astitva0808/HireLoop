import os
import requests

from dotenv import load_dotenv


load_dotenv()


class BreethService:

    def __init__(self):

        self.api_key = os.getenv("BREETH_API_KEY")

        self.base_url = os.getenv(
            "BREETH_BASE_URL",
            "https://api.thebreeth.com"
        )

        if not self.api_key:
            raise RuntimeError(
                "BREETH_API_KEY is not configured."
            )

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def remember(
        self,
        candidate_id: str,
        content: str,
    ):
        """
        Store meaningful candidate information
        as a Breeth episode.
        """

        group_id = f"candidate-{candidate_id}"

        response = requests.post(
            f"{self.base_url}/v1/episodes",
            headers=self.headers,
            json={
                "content": content,
                "group_id": group_id,
            },
            timeout=30,
        )

        response.raise_for_status()

        return response.json()

    def remember_fact(
        self,
        candidate_id: str,
        predicate: str,
        value: str,
    ):
        """
        Store a structured candidate fact.
        """

        group_id = f"candidate-{candidate_id}"

        response = requests.post(
            f"{self.base_url}/v1/facts",
            headers=self.headers,
            json={
                "subject": candidate_id,
                "predicate": predicate,
                "object": value,
                "group_id": group_id,
            },
            timeout=30,
        )

        response.raise_for_status()

        return response.json()

    def search(
        self,
        candidate_id: str,
        query: str,
        limit: int = 5,
    ):
        """
        Retrieve relevant memories for a candidate.
        """

        group_id = f"candidate-{candidate_id}"

        response = requests.post(
            f"{self.base_url}/v1/search",
            headers=self.headers,
            json={
                "query": query,
                "group_id": group_id,
                "limit": limit,
            },
            timeout=30,
        )

        response.raise_for_status()

        return response.json()