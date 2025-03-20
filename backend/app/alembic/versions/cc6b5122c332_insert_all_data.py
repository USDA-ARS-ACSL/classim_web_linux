"""insert all data

Revision ID: cc6b5122c332
Revises: 49947b2471ec
Create Date: 2024-11-20 11:56:56.839584

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'cc6b5122c332'
down_revision = '49947b2471ec'
branch_labels = None
depends_on = None


def upgrade():
    with open('/app/app/alembic/insert_data.sql') as file:
        op.execute(file.read())
def downgrade():
    pass