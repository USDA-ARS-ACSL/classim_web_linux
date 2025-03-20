"""update Irrigation Details Table with opID

Revision ID: 43ef4541e4ab
Revises: 456692a3b071
Create Date: 2025-03-14 13:06:12.410280

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '43ef4541e4ab'
down_revision = '456692a3b071'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('irrigationDetails', sa.Column('opID', sa.Integer))
def downgrade():
    pass