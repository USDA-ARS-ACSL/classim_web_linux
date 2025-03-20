"""Create c table

Revision ID: 0e8e17feac0f
Revises: fab2e43db89e
Create Date: 2024-06-13 15:57:44.487197

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0e8e17feac0f'
down_revision = 'fab2e43db89e'
branch_labels = None
depends_on = None


def upgrade():
    # Create the fertilizationClass table
    op.create_table(
        'fertilizationClass',
        sa.Column('fertilizationClass', sa.String(), nullable=False)
    )

def downgrade():
    # Drop the fertilizationClass table
    op.drop_table('fertilizationClass')