"""Create experiment table

Revision ID: fab2e43db89e
Revises: 4d0ee263d7f6
Create Date: 2024-06-13 15:54:07.306081

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fab2e43db89e'
down_revision = '4d0ee263d7f6'
branch_labels = None
depends_on = None


def upgrade():
    # Create the experiment table
    op.create_table(
        'experiment',
        sa.Column('exid', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('crop', sa.String(), nullable=False)
    )

def downgrade():
    # Drop the experiment table
    op.drop_table('experiment')