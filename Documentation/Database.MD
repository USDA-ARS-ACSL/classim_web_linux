these are the different classes for a database table
this describes how these different classes are used in the program
####### Site Models Begin#########
# Shared properties
class SiteBase(SQLModel):
    sitename: str | None = None
    rlat: float | None = None
    rlon: float | None = None
    altitude: float | None = None


# Properties to receive on item creation
class SiteCreate(SiteBase):
    sitename: str
    rlat: float
    rlon: float
    altitude: float


# Properties to receive on item update
class SiteUpdate(SiteBase):
    sitename: str | None = None  # type: ignore
    rlat: float | None = None  # type: ignore
    rlon: float | None = None  # type: ignore
    altitude: float | None = None  # type: ignore


# Database model, database table inferred from class name
class Site(SiteBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sitename: str | None = None  # type: ignore
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="sites")
    



# Properties to return via API, id is always required
class SitePublic(SiteBase):
    id: int | None = None  # type: ignore
    owner_id: int


class SitesPublic(SQLModel):
    data: list[SitePublic]
    count: int
####### Site model End############

Here’s how these classes are typically used in a FastAPI + SQLModel application:

### 1. SiteBase
- A base class with shared fields (sitename, rlat, rlon, altitude).
- Used as a parent for other models to avoid repeating code.

### 2. SiteCreate
- Inherits from SiteBase.
- Used for data validation when creating a new site (e.g., in POST requests).
- All fields are required (no default None).

### 3. SiteUpdate
- Inherits from SiteBase.
- Used for data validation when updating a site (e.g., in PATCH/PUT requests).
- All fields are optional (can update any subset).

### 4. Site
- Inherits from SiteBase and SQLModel’s table functionality.
- Represents the actual database table (table=True).
- Adds id (primary key), owner_id (foreign key), and owner (relationship to User).
- Used for ORM/database operations.

### 5. SitePublic
- Inherits from SiteBase.
- Used for API responses (what you send back to the client).
- Includes id and owner_id, which are always present in responses.

### 6. SitesPublic
- Used to return a list of sites and a count (for paginated API responses).

---

**Summary Table:**

| Class         | Purpose                                 | Used for                |
|---------------|-----------------------------------------|-------------------------|
| SiteBase      | Shared fields                           | Parent for other models |
| SiteCreate    | All fields required                     | Create (POST)           |
| SiteUpdate    | All fields optional                     | Update (PATCH/PUT)      |
| Site          | Database table, ORM model               | DB operations           |
| SitePublic    | API response with id/owner_id           | API output              |
| SitesPublic   | List of SitePublic + count (pagination) | API output (list)       |

Let me know if you want to see example usage in routes or CRUD functions!