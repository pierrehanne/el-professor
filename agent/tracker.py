import time
import datetime
from collections import defaultdict
import asyncio


class ModelUsageTracker:
    """
    tracks usage of different models with rate limits on
    requests per minute (RPM) and daily requests.

    this async version is designed to be safe in asynchronous
    environments by using an asyncio.Lock to protect the shared state.

    Attributes:
        model_limits (dict): Rate limits per model.
        rpm_counter (default dict): Counts of requests per model in the current minute.
        daily_counter (default dict): Counts of requests per model in the current day.
        last_rpm_reset (float): Timestamp of the last RPM counter reset.
        current_day (datetime.date): Date of the current day for daily resets.
        lock (asyncio.Lock): Async lock to ensure concurrency safety.
    """

    def __init__(self, model_limits: dict):
        """
        Initialize the tracker with specified model limits.

        Args:
            model_limits (dict): Dictionary where keys are model names
                and values are dictionaries with 'RPM' and 'daily_request' limits.
        """
        self.model_limits = model_limits
        self.rpm_counter = defaultdict(int)
        self.daily_counter = defaultdict(int)
        self.last_rpm_reset = time.monotonic()
        self.current_day = datetime.date.today()
        self.lock = asyncio.Lock()

    async def reset_if_needed(self) -> None:
        """
        Reset the RPM counter if more than 60 seconds have passed,
        and reset the daily counter if the day has changed.
        """
        now = time.monotonic()
        today = datetime.date.today()

        if now - self.last_rpm_reset >= 60:
            self.rpm_counter.clear()
            self.last_rpm_reset = now

        if today != self.current_day:
            self.daily_counter.clear()
            self.current_day = today

    async def increment_usage(self, model_name: str) -> None:
        """
        Increment the usage counters for a given model.

        This method acquires the lock to safely update counters and
        calls reset_if_needed to ensure counters are current.

        Args:
            model_name (str): The name of the model to increment usage for.
        """
        async with self.lock:
            await self.reset_if_needed()
            self.rpm_counter[model_name] += 1
            self.daily_counter[model_name] += 1

    async def can_use(self, model_name: str) -> bool:
        """
        Check if the model can be used under its rate limits.

        This method acquires the lock to safely read counters and
        calls reset_if_needed to ensure counters are current.

        Args:
            model_name (str): The name of the model to check.

        Returns:
            bool: True if usage is within limits, False otherwise.
        """
        async with self.lock:
            await self.reset_if_needed()
            limits = self.model_limits.get(model_name)
            if not limits:
                return False

            return (
                self.rpm_counter[model_name] < limits.get("RPM", 0) and
                self.daily_counter[model_name] < limits.get("daily_request", 0)
            )
