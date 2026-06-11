
"""merge migration heads

Revision ID: 06492ae40959
Revises: 20260610_0224, 6f9a1b2c3d45
Create Date: 2026-06-10 00:17:19.706745

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '06492ae40959'
down_revision: Union[str, Sequence[str], None] = ('20260610_0224', '6f9a1b2c3d45')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
