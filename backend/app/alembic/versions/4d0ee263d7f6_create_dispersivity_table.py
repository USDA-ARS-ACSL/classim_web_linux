"""Create dispersivity table

Revision ID: 4d0ee263d7f6
Revises: 319a87b3d661
Create Date: 2024-06-13 15:51:39.948752

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d0ee263d7f6'
down_revision = '319a87b3d661'
branch_labels = None
depends_on = None

def upgrade():
    # Create the dispersivity table
    op.create_table(
        'dispersivity',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('texturecl', sa.String(30)),
        sa.Column('alpha', sa.Float(), server_default='8.1')
    )

def downgrade():
    # Drop the dispersivity table
    op.drop_table('dispersivity')