from app.src.db import engine
from app.src.models.tables import metadata


def create_all():
    print("Creating tables...")
    metadata.create_all(bind=engine)
    print("Done.")


if __name__ == "__main__":
    create_all()
