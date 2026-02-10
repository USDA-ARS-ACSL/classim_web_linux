"""change date_time to string in nitrogen_potato2

Revision ID: 6e17e7986ee0
Revises: bba2c1364d45
Create Date: 2026-01-19 02:00:11.976533

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '6e17e7986ee0'
down_revision = 'bba2c1364d45'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('ALTER TABLE "nitrogen_potato" ALTER COLUMN "Date_Time" TYPE VARCHAR;')


def downgrade():
    op.execute('ALTER TABLE "nitrogen_potato" ALTER COLUMN "Date_Time" TYPE TEXT;')
