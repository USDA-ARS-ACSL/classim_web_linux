"""second try to remove keys for g0 ids

Revision ID: 19e0a50f5c7d
Revises: a9cfc422cc85
Create Date: 2026-01-16 13:01:35.289777

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '19e0a50f5c7d'
down_revision = 'a9cfc422cc85'
branch_labels = None
depends_on = None

tables1 = [
      "g04_maize", "g05_maize", "g07_maize",
    "g01_soybean", "g03_soybean", "g04_soybean", "g05_soybean", "g07_soybean",
     "g03_cotton", "g04_cotton", "g05_cotton", "g07_cotton",
     "g04_potato", "g05_potato", "g07_potato",
    "g07_fallow", "g05_fallow", "g03_fallow"
]
tables2 =[
     "g01_soybean", "g05_soybean", "g07_cotton",  "g07_fallow",
       "g07_soybean"
]

def upgrade():
      for table in tables1:
        op.drop_constraint(f"{table}_pkey", table, type_='primary')
        op.alter_column(table, f"{table}_id", nullable=True)

      for table in tables2:
            col=f"{table}_id"
            op.execute(f'ALTER TABLE {table} ALTER COLUMN {col} DROP IDENTITY IF EXISTS;')



def downgrade():
    pass
