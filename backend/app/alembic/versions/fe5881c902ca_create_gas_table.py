"""Create gas table

Revision ID: fe5881c902ca
Revises: dacc9a021a47
Create Date: 2024-06-13 16:12:58.224058

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'fe5881c902ca'
down_revision = 'dacc9a021a47'
branch_labels = None
depends_on = None


def upgrade():
    # Create the gas table
    op.create_table(
        'gas',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(30), nullable=False),
        sa.Column('EPSI', sa.Float(), server_default='1'),
        sa.Column('bTort', sa.Float(), server_default='0.65'),
        sa.Column('Diffusion_Coeff', sa.Float(), nullable=False)
    )

def downgrade():
    # Drop the gas table
    op.drop_table('gas')
