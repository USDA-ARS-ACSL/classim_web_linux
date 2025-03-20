"""Create PGROp table

Revision ID: 57d984ad6601
Revises: c98721b71d84
Create Date: 2024-06-13 16:30:02.972139

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '57d984ad6601'
down_revision = 'c98721b71d84'
branch_labels = None
depends_on = None


def upgrade():
    # Create the PGROp table
    op.create_table(
        'PGROp',
        sa.Column('opID', sa.Integer(), primary_key=True),
        sa.Column('PGRChemical', sa.Text(), nullable=False),
        sa.Column('applicationType', sa.Text(), nullable=False),
        sa.Column('bandwidth', sa.Float(), nullable=False),
        sa.Column('applicationRate', sa.Float(), nullable=False),
        sa.Column('PGRUnit', sa.Text(), nullable=False)
    )

def downgrade():
    # Drop the PGROp table
    op.drop_table('PGROp')
