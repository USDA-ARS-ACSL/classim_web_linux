"""Create mulchGeo table

Revision ID: e7cde1f9d333
Revises: 676474ed0fab
Create Date: 2024-06-13 16:21:14.616164

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e7cde1f9d333'
down_revision = '676474ed0fab'
branch_labels = None
depends_on = None


def upgrade():
    # Create the mulchGeo table
    op.create_table(
        'mulchGeo',
        sa.Column('nutrient', sa.String(), nullable=False),
        sa.Column('minHoriSize', sa.Float(), nullable=False),
        sa.Column('diffusionRestriction', sa.Float(), nullable=False),
        sa.Column('longWaveRadiationCtrl', sa.Float(), nullable=False),
        sa.Column('decompositionCtrl', sa.Float(), nullable=False),
        sa.Column('deltaRShort', sa.Float(), nullable=False),
        sa.Column('deltaRLong', sa.Float(), nullable=False),
        sa.Column('omega', sa.Float(), nullable=False),
        sa.Column('epsilonMulch', sa.Float(), nullable=False),
        sa.Column('alphaMulch', sa.Float(), nullable=False),
        sa.Column('maxStepInPicardIteration', sa.Float(), nullable=False),
        sa.Column('toleranceHead', sa.Float(), nullable=False),
        sa.Column('rhoMulch', sa.Float(), nullable=False),
        sa.Column('poreSpace', sa.Float(), nullable=False),
        sa.Column('maxPondingDepth', sa.Float(), nullable=False)
    )

def downgrade():
    # Drop the mulchGeo table
    op.drop_table('mulchGeo')