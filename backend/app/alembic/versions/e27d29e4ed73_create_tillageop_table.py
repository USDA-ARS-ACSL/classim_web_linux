"""Create tillageOp table

Revision ID: e27d29e4ed73
Revises: ae9598759788
Create Date: 2024-06-13 16:51:05.693047

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e27d29e4ed73'
down_revision = 'ae9598759788'
branch_labels = None
depends_on = None


def upgrade():
    # Create the tillageOp table
    op.create_table(
        'tillageOp',
        sa.Column('opID', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('tillage', sa.String(40), nullable=False)
    )

def downgrade():
    # Drop the tillageOp table
    op.drop_table('tillageOp')