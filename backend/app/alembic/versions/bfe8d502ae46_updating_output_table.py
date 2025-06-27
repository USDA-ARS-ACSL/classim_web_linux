"""updating output table

Revision ID: bfe8d502ae46
Revises: 421753f0620f
Create Date: 2025-06-27 12:47:19.428033

"""
from alembic import op
import os
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bfe8d502ae46'
down_revision = '421753f0620f'
branch_labels = None
depends_on = None


from sqlalchemy import text

# Directory where the SQL files are stored
sql_directory = "/app/app/alembic/outputDbSql/"

def run_sql_file(file_path):
    """Execute a single SQL file."""
    with open(file_path, 'r') as f:
        sql = f.read()
    op.execute(text(sql))

def upgrade():
    # Loop over all SQL files and execute them
    for sql_file in os.listdir(sql_directory):
        if sql_file.endswith('.sql'):
            file_path = os.path.join(sql_directory, sql_file)
            run_sql_file(file_path)

def downgrade():
    # Here you might want to reverse the changes made by the SQL files, if possible.
    pass