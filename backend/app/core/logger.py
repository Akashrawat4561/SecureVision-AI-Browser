import logging
import sys
import os

def get_logger(name: str = "securevision"):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        # Console handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
        )
        ch.setFormatter(formatter)
        logger.addHandler(ch)
        
        # File handler centralized
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
        os.makedirs(log_dir, exist_ok=True)
        fh = logging.FileHandler(os.path.join(log_dir, "securevision_central.log"))
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        
    return logger

logger = get_logger()
