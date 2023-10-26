from readee import db, app
from readee import User, Session, Book

with app.app_context():
    db.drop_all()
    db.create_all()