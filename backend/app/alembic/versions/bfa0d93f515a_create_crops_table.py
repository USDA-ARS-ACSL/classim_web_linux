"""create crops table

Revision ID: bfa0d93f515a
Revises: d9f2833675be
Create Date: 2024-06-12 15:22:33.476132

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'bfa0d93f515a'
down_revision = 'd9f2833675be'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('crops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cropname', sa.String(length=30), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('crops')
