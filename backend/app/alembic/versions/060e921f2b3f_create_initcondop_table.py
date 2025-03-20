"""Create initCondOp table

Revision ID: 060e921f2b3f
Revises: fe5881c902ca
Create Date: 2024-06-13 16:14:34.426690

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '060e921f2b3f'
down_revision = 'fe5881c902ca'
branch_labels = None
depends_on = None


def upgrade():
    # Create the initCondOp table
    op.create_table(
        'initCondOp',
        sa.Column('opID', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pop', sa.Float(), nullable=False),
        sa.Column('autoirrigation', sa.Float(), nullable=False),
        sa.Column('xseed', sa.Float(), nullable=False),
        sa.Column('yseed', sa.Float(), nullable=False),
        sa.Column('cec', sa.Float(), nullable=False),
        sa.Column('eomult', sa.Float(), nullable=False),
        sa.Column('rowSpacing', sa.Float(), nullable=False),
        sa.Column('cultivar', sa.String(), nullable=False),
        sa.Column('seedpieceMass', sa.Float(), nullable=False)
    )

def downgrade():
    # Drop the initCondOp table
    op.drop_table('initCondOp')
