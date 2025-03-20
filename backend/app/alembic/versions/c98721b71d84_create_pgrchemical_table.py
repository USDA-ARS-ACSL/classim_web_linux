"""Create PGRChemical table

Revision ID: c98721b71d84
Revises: 4c14639eb8b7
Create Date: 2024-06-13 16:27:13.385850

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c98721b71d84'
down_revision = '4c14639eb8b7'
branch_labels = None
depends_on = None


def upgrade():
    # Create the PGRChemical table
    op.create_table(
        'PGRChemical',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('PGRChemical', sa.String(40), nullable=False)
    )

def downgrade():
    # Drop the PGRChemical table
    op.drop_table('PGRChemical')
