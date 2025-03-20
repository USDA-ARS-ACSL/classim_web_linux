"""Create surfResType table

Revision ID: ae9598759788
Revises: f8bc6baf5e37
Create Date: 2024-06-13 16:49:55.428328

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ae9598759788'
down_revision = 'f8bc6baf5e37'
branch_labels = None
depends_on = None


def upgrade():
    # Create the surfResType table
    op.create_table(
        'surfResType',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('residueType', sa.String(40), nullable=False)
    )

def downgrade():
    # Drop the surfResType table
    op.drop_table('surfResType')
