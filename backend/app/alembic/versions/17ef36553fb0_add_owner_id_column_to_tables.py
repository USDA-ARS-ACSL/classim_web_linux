"""Add owner_id column to tables

Revision ID: 17ef36553fb0
Revises: 386764bdebf7
Create Date: 2025-02-14 16:36:08.180570

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '17ef36553fb0'
down_revision = '386764bdebf7'
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    for table in tables:
        if table not in ["biologydefault", "classimVersion", "crops", "dispersivity", "fertilizationClass", 
                 "gas", "fertNutrient", "irrigationType", "mulchDecomp", "mulchGeo", 
                 "PGRApplType", "PGRChemical", "PGRUnit", "solute", "surfResApplType", 
                 "surfResType", "tillageType","weather_data"]: # Skip the user table
            columns = [col["name"] for col in inspector.get_columns(table)]
            if "owner_id" not in columns:
                op.add_column(table, sa.Column('owner_id', sa.Integer(), sa.ForeignKey('user.id')))

def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    not_allowed_table = ["biologydefault", "classimVersion", "crops", "dispersivity", "fertilizationClass", 
                 "gas", "fertNutrient", "irrigationType", "mulchDecomp", "mulchGeo", 
                 "PGRApplType", "PGRChemical", "PGRUnit", "solute", "surfResApplType", 
                 "surfResType", "tillageType","weather_data"]
    for table in tables:
        if table not in not_allowed_table:  # Skip the user table
            columns = [col["name"] for col in inspector.get_columns(table)]
            if "owner_id" in columns:
                op.drop_column(table, 'owner_id')
