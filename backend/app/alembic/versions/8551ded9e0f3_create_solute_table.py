"""Create solute table

Revision ID: 8551ded9e0f3
Revises: d40cbcb97e43
Create Date: 2024-06-13 16:36:44.630044

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8551ded9e0f3'
down_revision = 'd40cbcb97e43'
branch_labels = None
depends_on = None


def upgrade():
    # Create the solute table
    op.create_table(
        'solute',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(30), default='NitrogenDefault'),
        sa.Column('EPSI', sa.Float(), default=0.8),
        sa.Column('IUPW', sa.Float(), default=0),
        sa.Column('CourMax', sa.Float(), default=0.5),
        sa.Column('Diffusion_Coeff', sa.Float(), default=1.2)
    )

def downgrade():
    # Drop the solute table
    op.drop_table('solute')
