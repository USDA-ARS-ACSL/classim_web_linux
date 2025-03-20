"""Create sitedetails table

Revision ID: d40cbcb97e43
Revises: b2328beb83ac
Create Date: 2024-06-13 16:34:42.445621

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd40cbcb97e43'
down_revision = 'b2328beb83ac'
branch_labels = None
depends_on = None


def upgrade():
    # Create the sitedetails table
    op.create_table(
        'sitedetails',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sitename', sa.String(30), nullable=False),
        sa.Column('rlat', sa.Float(), nullable=False),
        sa.Column('rlon', sa.Float(), nullable=False),
        sa.Column('altitude', sa.Float())
    )

def downgrade():
    # Drop the sitedetails table
    op.drop_table('sitedetails')
