"""create irrigationClass

Revision ID: 386764bdebf7
Revises: 32f68eb14a97
Create Date: 2024-11-21 12:33:34.043775

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '386764bdebf7'
down_revision = '32f68eb14a97'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'IrrigationClass',
        sa.Column('irrigationClass', sa.String(200), primary_key=True)
    )


def downgrade():
    pass
