from sqlalchemy import Column, Integer, String, Float
from core.database import Base
import time

class BookmarkItem(Base):
    __tablename__ = "bookmarks"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=True)
    url = Column(String(1000), nullable=False)
    created_at = Column(Float, default=time.time)
