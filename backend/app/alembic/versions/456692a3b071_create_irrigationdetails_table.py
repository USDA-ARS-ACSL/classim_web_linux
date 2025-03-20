"""create irrigationClass Table

Revision ID: 456692a3b071
Revises: 17ef36553fb0
Create Date: 2025-03-14 12:09:24.301032

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '456692a3b071'
down_revision = '17ef36553fb0'
branch_labels = None
depends_on = None

def upgrade():
    '''File Name should be IrrigationDetails.py'''
    op.create_table('irrigationDetails',
        sa.Column('irrigationClass', sa.String(200), primary_key=True),
        sa.Column('o_t_exid', sa.Integer)
    )
def downgrade():
    op.drop_table('irrigationDetails')