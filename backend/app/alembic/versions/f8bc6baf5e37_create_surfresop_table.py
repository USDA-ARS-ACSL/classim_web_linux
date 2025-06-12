"""Create surfResOp table

Revision ID: f8bc6baf5e37
Revises: c178c03d7212
Create Date: 2024-06-13 16:48:44.582057

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f8bc6baf5e37'
down_revision = 'c178c03d7212'
branch_labels = None
depends_on = None


def upgrade():
    # Create the surfResOp table
    op.create_table(
        'surfResOp',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('opID'),
        sa.Column('residueType', sa.String(40), nullable=False),
        sa.Column('applicationType', sa.Text(), nullable=False),
        sa.Column('applicationTypeValue', sa.Float(), nullable=False)
    )

def downgrade():
    # Drop the surfResOp table
    op.drop_table('surfResOp')
