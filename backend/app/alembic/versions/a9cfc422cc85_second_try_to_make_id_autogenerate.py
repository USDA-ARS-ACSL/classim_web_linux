"""second try to make id autogenerate

Revision ID: a9cfc422cc85
Revises: 68f7836f9a3f
Create Date: 2026-01-16 01:37:04.909531

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a9cfc422cc85'
down_revision = '68f7836f9a3f'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
