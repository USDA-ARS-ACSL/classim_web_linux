"""creating_cultivar_tab_tables

Revision ID: 3703c0de746a
Revises: 18a35d4fc0a6
Create Date: 2024-07-12 10:05:20.134626

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '3703c0de746a'
down_revision = '18a35d4fc0a6'
branch_labels = None
depends_on = None


def upgrade()-> None:
    with open('/app/app/alembic/cultivar_cotton.sql') as file:
        op.execute(file.read())
    with open('/app/app/alembic/cultivar_maize.sql') as file:
        op.execute(file.read())
    with open('/app/app/alembic/cultivar_potato.sql') as file:
        op.execute(file.read())
    with open('/app/app/alembic/cultivar_soybean.sql') as file:
        op.execute(file.read())
