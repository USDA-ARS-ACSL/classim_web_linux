"""Create pastruns table

Revision ID: 61fd15216cc7
Revises: 8a91484ad319
Create Date: 2024-06-13 16:23:31.053049

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '61fd15216cc7'
down_revision = '8a91484ad319'
branch_labels = None
depends_on = None


def upgrade():
    # Create the pastruns table
    op.create_table(
        'pastruns',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('rotationID', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('site', sa.String(30), nullable=False),
        sa.Column('treatment', sa.String(50), nullable=False),
        sa.Column('weather', sa.String(50), nullable=False),
        sa.Column('soil', sa.String(50), nullable=False),
        sa.Column('stationtype', sa.Text(), nullable=False),
        sa.Column('startyear', sa.Integer(), nullable=False),
        sa.Column('endyear', sa.Integer(), nullable=False),
        sa.Column('odate', sa.Integer()),
        sa.Column('waterstress', sa.Integer()),
        sa.Column('nitrostress', sa.Integer()),
        sa.Column('tempVar', sa.Integer(), server_default='0'),
        sa.Column('rainVar', sa.Integer(), server_default='0'),
        sa.Column('CO2Var', sa.Integer(), server_default='0')
    )

def downgrade():
    # Drop the pastruns table
    op.drop_table('pastruns')
