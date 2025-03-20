"""Create treatment table

Revision ID: 18a35d4fc0a6
Revises: 9bd11b60be4c
Create Date: 2024-06-13 16:53:32.554762

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '18a35d4fc0a6'
down_revision = '9bd11b60be4c'
branch_labels = None
depends_on = None


def upgrade():
    # Create the treatment table
    op.create_table(
        'treatment',
        sa.Column('tid', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('t_exid', sa.Integer(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False)
    )

def downgrade():
    # Drop the treatment table
    op.drop_table('treatment')