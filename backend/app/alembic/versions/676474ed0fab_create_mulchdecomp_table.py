"""Create mulchDecomp table

Revision ID: 676474ed0fab
Revises: 3f5224e47686
Create Date: 2024-06-13 16:19:02.080261

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '676474ed0fab'
down_revision = '3f5224e47686'
branch_labels = None
depends_on = None


def upgrade():
    # Create the mulchDecomp table
    op.create_table(
        'mulchDecomp',
        sa.Column('nutrient', sa.String(), nullable=False),
        sa.Column('contactFraction', sa.Float(), nullable=False),
        sa.Column('alphaFeeding', sa.Float(), nullable=False),
        sa.Column('carbMass', sa.Float(), nullable=False),
        sa.Column('cellMass', sa.Float(), nullable=False),
        sa.Column('lignMass', sa.Float(), nullable=False),
        sa.Column('carbNMass', sa.Float(), nullable=False),
        sa.Column('cellNMass', sa.Float(), nullable=False),
        sa.Column('lignNMass', sa.Float(), nullable=False),
        sa.Column('carbDecomp', sa.Float(), nullable=False),
        sa.Column('cellDecomp', sa.Float(), nullable=False),
        sa.Column('lignDecomp', sa.Float(), nullable=False)
    )

def downgrade():
    # Drop the mulchDecomp table
    op.drop_table('mulchDecomp')






