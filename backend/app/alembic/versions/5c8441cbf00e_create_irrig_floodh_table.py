"""Create Irrig_floodH table

Revision ID: 5c8441cbf00e
Revises: 43ef4541e4ab
Create Date: 2025-03-17 15:11:51.547012

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5c8441cbf00e'
down_revision = '43ef4541e4ab'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('irrig_floodH',
    sa.Column('opID', sa.Integer(), nullable=False),
    sa.Column('irrigationClass', sa.Text(), nullable=False),
    sa.Column('pondDepth', sa.REAL(), nullable=False),
    sa.Column('irrStartD', sa.Text(), nullable=False),
    sa.Column('startH', sa.Text(), nullable=False),
    sa.Column('irrStopD', sa.Text(), nullable=False),
    sa.Column('stopH', sa.Text(), nullable=False),
    )

def downgrade():
    op.drop_table('irrig_floodH')