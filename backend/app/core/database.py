import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from core.logger import logger

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = None

if SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
else:
    try:
        pg_url = "postgresql://postgres:postgres@localhost:5432/securevision"
        engine = create_engine(pg_url)
        with engine.connect() as conn:
            logger.info("Connected to PostgreSQL successfully.")
            SQLALCHEMY_DATABASE_URL = pg_url
    except Exception as e:
        logger.error(f"PostgreSQL connection failed. Falling back to SQLite.")
        SQLALCHEMY_DATABASE_URL = "sqlite:///./securevision.db"
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
