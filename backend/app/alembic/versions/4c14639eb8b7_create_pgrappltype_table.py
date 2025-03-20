"""Create PGRApplType table

Revision ID: 4c14639eb8b7
Revises: 61fd15216cc7
Create Date: 2024-06-13 16:25:17.603693

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4c14639eb8b7'
down_revision = '61fd15216cc7'
branch_labels = None
depends_on = None


def upgrade():
    # Create the PGRApplType table
    op.create_table(
        'PGRApplType',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('applicationType', sa.String(40), nullable=False),
        sa.Column('code', sa.Integer(), nullable=False)
    )

def downgrade():
    # Drop the PGRApplType table
    op.drop_table('PGRApplType')
