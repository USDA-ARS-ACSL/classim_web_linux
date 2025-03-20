"""Create operations table

Revision ID: 8a91484ad319
Revises: e7cde1f9d333
Create Date: 2024-06-13 16:22:27.360050

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8a91484ad319'
down_revision = 'e7cde1f9d333'
branch_labels = None
depends_on = None


def upgrade():
    # Create the operations table
    op.create_table(
        'operations',
        sa.Column('opID', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('o_t_exid', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('odate', sa.String(), nullable=False)
    )

def downgrade():
    # Drop the operations table
    op.drop_table('operations')