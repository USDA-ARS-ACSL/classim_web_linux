"""Create surfResApplType table

Revision ID: c178c03d7212
Revises: 8551ded9e0f3
Create Date: 2024-06-13 16:46:48.372677

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c178c03d7212'
down_revision = '8551ded9e0f3'
branch_labels = None
depends_on = None


def upgrade():
    # Create the surfResApplType table
    op.create_table(
        'surfResApplType',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('applicationType', sa.String(40), nullable=False)
    )

def downgrade():
    # Drop the surfResApplType table
    op.drop_table('surfResApplType')