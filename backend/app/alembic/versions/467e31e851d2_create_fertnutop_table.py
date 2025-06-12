"""Create fertNutOp table

Revision ID: 467e31e851d2
Revises: 0e8e17feac0f
Create Date: 2024-06-13 16:07:19.100363

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '467e31e851d2'
down_revision = '0e8e17feac0f'
branch_labels = None
depends_on = None


def upgrade():
    # Create the fertNutOp table
    op.create_table(
        'fertNutOp',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('opID', sa.Integer()),
        sa.Column('nutrient', sa.String(), nullable=False),
        sa.Column('nutrientQuantity', sa.REAL(), nullable=False)
    )

def downgrade():
    # Drop the fertNutOp table
    op.drop_table('fertNutOp')
