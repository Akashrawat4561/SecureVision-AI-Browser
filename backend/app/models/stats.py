from sqlalchemy import Column, Integer, String
from core.database import Base

class SystemStats(Base):
    __tablename__ = "system_stats"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Integer, default=0)
