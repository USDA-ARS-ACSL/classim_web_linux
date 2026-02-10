"""change date_time to string in nitrogen_potato

Revision ID: bba2c1364d45
Revises: d2f4fcd71151
Create Date: 2026-01-19 01:56:24.380813

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'bba2c1364d45'
down_revision = 'd2f4fcd71151'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('ALTER TABLE "nitrogen_potato" ALTER COLUMN "Date_Time" TYPE TEXT;')


def downgrade():
    op.execute('ALTER TABLE "nitrogen_potato" ALTER COLUMN "Date_Time" TYPE INT;')
