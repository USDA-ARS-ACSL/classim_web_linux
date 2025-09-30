"""removing PK for irrigation details

Revision ID: 84377e9eaa6c
Revises: 5ad244ce6c84
Create Date: 2025-09-30 16:53:50.730908

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '84377e9eaa6c'
down_revision = '5ad244ce6c84'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the primary key constraint
    op.drop_constraint('irrigationDetails_pkey', 'irrigationDetails', type_='primary')

def downgrade():
    # Re-add the primary key constraint on 'irrigationClass'
    op.create_primary_key('irrigationDetails_pkey', 'irrigationDetails', ['irrigationClass'])