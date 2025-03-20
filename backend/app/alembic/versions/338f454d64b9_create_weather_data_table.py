"""Create weather_data table

Revision ID: 338f454d64b9
Revises: 6c4e24f3b7ff
Create Date: 2024-06-06 13:54:48.793055

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '338f454d64b9'
down_revision = '6c4e24f3b7ff'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'weather_data',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('stationtype', sa.Text),
        sa.Column('weather_id', sa.Text, nullable=False),
        sa.Column('jday', sa.Integer),
        sa.Column('date', sa.Text),
        sa.Column('hour', sa.Integer),
        sa.Column('srad', sa.REAL),
        sa.Column('wind', sa.REAL),
        sa.Column('rh', sa.REAL),
        sa.Column('rain', sa.REAL),
        sa.Column('tmax', sa.REAL),
        sa.Column('tmin', sa.REAL),
        sa.Column('temperature', sa.REAL),
        sa.Column('co2', sa.REAL),
    )

    # op.create_foreign_key(
    #     'fk_weather_data_weather_meta',
    #     'weather_data', 'weather_meta',
    #     ['weather_id'], ['id']
    # )

def downgrade():
    op.drop_table('weather_data')