import os

DB_USER = "root"
DB_PASSWORD = "vk124424861014"
DB_HOST = "localhost"
DB_NAME = "smart_classroom_db"

SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False
