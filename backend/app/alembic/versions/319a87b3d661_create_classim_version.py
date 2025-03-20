"""create classim version

Revision ID: 319a87b3d661
Revises: bfa0d93f515a
Create Date: 2024-06-13 15:18:43.215870

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '319a87b3d661'
down_revision = 'bfa0d93f515a'
branch_labels = None
depends_on = None

def upgrade():
    # Create the classimVersion table
    op.create_table(
        'classimVersion',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('version', sa.Text(), nullable=False),
        sa.Column('date', sa.Text(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=False)
    )

def downgrade():
    # Drop the classimVersion table
    op.drop_table('classimVersion')

    
