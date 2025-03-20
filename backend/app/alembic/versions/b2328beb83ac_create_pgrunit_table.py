"""Create PGRUnit table

Revision ID: b2328beb83ac
Revises: 57d984ad6601
Create Date: 2024-06-13 16:32:27.709715

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2328beb83ac'
down_revision = '57d984ad6601'
branch_labels = None
depends_on = None


def upgrade():
    # Create the PGRUnit table
    op.create_table(
        'PGRUnit',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('PGRUnit', sa.String(40), nullable=False),
        sa.Column('code', sa.Integer(), nullable=False)
    )

def downgrade():
    # Drop the PGRUnit table
    op.drop_table('PGRUnit')
