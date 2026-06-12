"""Create an admin user.

Admins cannot self-register through the UI (the registration form only
offers candidate/recruiter), so use this one-off script to create one.

Usage:
    ADMIN_NAME="Admin" ADMIN_EMAIL="admin@example.com" \
    ADMIN_PASSWORD="change-me" python create_admin.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User

name = os.getenv("ADMIN_NAME", "Admin")
email = os.getenv("ADMIN_EMAIL")
password = os.getenv("ADMIN_PASSWORD")

if not email or not password:
    raise SystemExit(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables."
    )

with app.app_context():
    existing = User.query.filter_by(email=email).first()

    if existing:
        existing.role = "admin"
        existing.name = name
        existing.password = password
        print(f"Updated existing user to admin: {email}")
    else:
        db.session.add(
            User(name=name, email=email, password=password, role="admin")
        )
        print(f"Created admin: {email}")

    db.session.commit()
