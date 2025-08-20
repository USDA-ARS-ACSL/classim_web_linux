"""Create weather_meta table

Revision ID: 6c4e24f3b7ff
Revises: 2eb08d169d1d
Create Date: 2024-06-06 13:53:01.128073

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '6c4e24f3b7ff'
down_revision = '2eb08d169d1d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'weather_meta',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('stationtype', sa.String(30)),
        sa.Column('site', sa.String(30), default='Station1'),
        sa.Column('Bsolar', sa.Float, default=1.00E+06),
        sa.Column('Btemp', sa.Integer, default=1),
        sa.Column('Atemp', sa.Integer, default=0),
        sa.Column('BWInd', sa.Integer, default=1),
        sa.Column('BIR', sa.Integer, default=1),
        sa.Column('AvgWind', sa.Float, default=3.0),
        sa.Column('AvgRainRate', sa.Float, default=10.0),
        sa.Column('ChemCOnc', sa.Float, default=0),
        sa.Column('AvgCO2', sa.Float, default=380.0),
    )

def downgrade():
    op.drop_table('weather_meta')