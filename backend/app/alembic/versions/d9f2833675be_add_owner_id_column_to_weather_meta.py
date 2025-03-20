"""Add owner_id column to weather_meta

Revision ID: d9f2833675be
Revises: 338f454d64b9
Create Date: 2024-06-07 06:36:22.376306

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'd9f2833675be'
down_revision = '338f454d64b9'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('weather_meta', 
        sa.Column('owner_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_weather_meta_owner_id",
        "weather_meta",
        "user", #owner_id is from user table
        ["owner_id"],
        ["id"],
        ondelete="CASCADE"
    )

def downgrade():
    op.drop_constraint("fk_weather_meta_owner_id", "weather_meta", type_="foreignkey")
    op.drop_column('weather_meta', 'owner_id')
