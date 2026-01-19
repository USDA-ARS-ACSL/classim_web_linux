"""rename two columns in potato plant file

Revision ID: 54d9d6130f24
Revises: 07e4c0048fac
Create Date: 2026-01-18 03:37:30.539851

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '54d9d6130f24'
down_revision = '07e4c0048fac'
branch_labels = None
depends_on = None

from alembic import op

def upgrade():
    pass

def downgrade():
    pass

