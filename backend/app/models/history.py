from sqlalchemy import Column, Integer, String, Float
from core.database import Base
import time

class HistoryItem(Base):
    __tablename__ = "history"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=True)
    url = Column(String(1000), nullable=False)
    ts = Column(Float, default=time.time)
