"""Create tables from SQL files

Revision ID: 32f68eb14a97
Revises: cc6b5122c332
Create Date: 2024-11-20 12:14:07.165465

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
import os


# revision identifiers, used by Alembic.
revision = '32f68eb14a97'
down_revision = 'cc6b5122c332'
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