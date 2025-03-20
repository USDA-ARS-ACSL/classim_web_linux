"""Create fertNutrient table

Revision ID: dacc9a021a47
Revises: 467e31e851d2
Create Date: 2024-06-13 16:09:41.584241

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dacc9a021a47'
down_revision = '467e31e851d2'
branch_labels = None
depends_on = None


def upgrade():
    # Create the fertNutrient table
    op.create_table(
        'fertNutrient',
        sa.Column('fertilizationClass', sa.String(), nullable=False),
        sa.Column('Nutrient', sa.String(), nullable=False)
    )

def downgrade():
    # Drop the fertNutrient table
    op.drop_table('fertNutrient')
