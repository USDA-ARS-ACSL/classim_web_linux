"""Create irrigationType table

Revision ID: 3f5224e47686
Revises: 060e921f2b3f
Create Date: 2024-06-13 16:17:15.244590

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f5224e47686'
down_revision = '060e921f2b3f'
branch_labels = None
depends_on = None


def upgrade():
    # Create the irrigationType table
    op.create_table(
        'irrigationType',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('irrigation', sa.String(40), nullable=False),
        sa.Column('description', sa.String(80), nullable=True)
    )

def downgrade():
    # Drop the irrigationType table
    op.drop_table('irrigationType')
