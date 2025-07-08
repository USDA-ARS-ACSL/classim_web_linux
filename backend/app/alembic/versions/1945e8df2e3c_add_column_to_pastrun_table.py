"""Add column to pastrun table

Revision ID: 1945e8df2e3c
Revises: bfe8d502ae46
Create Date: 2025-07-07 14:14:55.621572

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1945e8df2e3c'
down_revision = 'bfe8d502ae46'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('pastruns', sa.Column('status', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('pastruns', 'status')
