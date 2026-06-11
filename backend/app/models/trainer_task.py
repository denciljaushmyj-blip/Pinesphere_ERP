"""
PINESPHERE ERP
Module      : Trainer Portal — Task Module
File        : trainer_task.py
Purpose     : Defines TrainerTask database model for the Trainer Portal.
              Tracks pending tasks visible on the trainer dashboard.
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# SECTION: IMPORTS
# PURPOSE:
# This section loads external libraries, framework tools, and local helpers.
# Keeping imports together makes dependencies easy to review.
# =====================================================

from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


# =====================================================
# SECTION: DATABASE MODELS
# PURPOSE:
# This section defines database table structures.
# Each model maps Python objects to rows stored by the database.
# =====================================================

class TrainerTask(Base):
    """A task assigned to a trainer — visible on the trainer dashboard."""

    __tablename__ = "trainer_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True, index=True)
    status = Column(String, default="pending", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trainer = relationship("User", foreign_keys=[trainer_id])