"""Create tillageType table

Revision ID: 9bd11b60be4c
Revises: e27d29e4ed73
Create Date: 2024-06-13 16:52:19.742191

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9bd11b60be4c'
down_revision = 'e27d29e4ed73'
branch_labels = None
depends_on = None


def upgrade():
    # Create the tillageType table
    op.create_table(
        'tillageType',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tillage', sa.String(40), nullable=False),
        sa.Column('description', sa.String(80))
    )

def downgrade():
    # Drop the tillageType table
    op.drop_table('tillageType')
