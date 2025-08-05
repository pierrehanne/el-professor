import logging
import os


class Logger:
    """
    Centralized logger configuration utility.
    Provides reusable logger instances across the application.
    """

    _instances = {}

    @classmethod
    def get_logger(cls, name: str = "el-professor") -> logging.Logger:
        """
        Returns a named logger instance with consistent configuration.

        Args:
            name (str): Logger name. Defaults to "el-professor".

        Returns:
            logging.Logger: Configured logger.
        """
        if name in cls._instances:
            return cls._instances[name]

        logger = logging.getLogger(name)

        if not logger.hasHandlers():

            # Dynamic level from environment
            level_str = os.getenv("LOG_LEVEL", "INFO").upper()
            level = getattr(logging, level_str, logging.INFO)
            logger.setLevel(level)

            # Format
            formatter = logging.Formatter(
                fmt="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )

            # Console Handler
            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(formatter)
            logger.addHandler(stream_handler)

            # Optional file handler
            log_file = os.getenv("LOG_FILE")
            if log_file:
                file_handler = logging.FileHandler(log_file)
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)

            logger.propagate = False  # Avoid double logs

        cls._instances[name] = logger
        return logger