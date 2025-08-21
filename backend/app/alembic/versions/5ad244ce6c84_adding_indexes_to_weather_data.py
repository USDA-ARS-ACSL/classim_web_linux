"""adding indexes to weather data

Revision ID: 5ad244ce6c84
Revises: 1945e8df2e3c
Create Date: 2025-08-21 14:29:12.119630

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5ad244ce6c84'
down_revision = '1945e8df2e3c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create indexes for optimized queries
    op.create_index('idx_weather_data_weather_id', 'weather_data', ['weather_id'], unique=False)
    op.create_index('idx_weather_data_date', 'weather_data', ['date'], unique=False)
    op.create_index('idx_weather_data_station_date', 'weather_data', ['stationtype', 'date'], unique=False)


def downgrade() -> None:
    # Drop indexes if migration needs to be reversed
    op.drop_index('idx_weather_data_station_date', table_name='weather_data')
    op.drop_index('idx_weather_data_date', table_name='weather_data')
    op.drop_index('idx_weather_data_weather_id', table_name='weather_data')