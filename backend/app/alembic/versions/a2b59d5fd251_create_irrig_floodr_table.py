"""Create Irrig_floodR table

Revision ID: a2b59d5fd251
Revises: 5c8441cbf00e
Create Date: 2025-03-17 15:14:44.337977

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a2b59d5fd251'
down_revision = '5c8441cbf00e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('irrig_floodR',
    sa.Column('opID', sa.Integer(), nullable=False),
    sa.Column('irrigationClass', sa.Text(), nullable=False),
    sa.Column('pondDepth', sa.REAL(), nullable=False),
    sa.Column('rate', sa.Integer(), nullable=False),
    sa.Column('irrStartD', sa.Text(), nullable=False),
    sa.Column('startH', sa.Text(), nullable=False), 
    sa.Column('irrStopD', sa.Text(), nullable=False),
    sa.Column('stopH', sa.Text(), nullable=False),
    )
def downgrade():
    op.drop_table('irrig_floodR')