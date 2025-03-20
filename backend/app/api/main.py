from fastapi import APIRouter

from app.api.routes import items, login, users, utils, faq, site, soil, weather, gridratio, management, cultivar, seasonal, simoutput

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(faq.router, prefix="/faq", tags=["faqs"])
api_router.include_router(site.router, prefix="/site", tags=["sitedetails"])
api_router.include_router(soil.router, prefix="/soil", tags=["soildetails"])
api_router.include_router(weather.router, prefix="/weather", tags=["weatherdetails"])
api_router.include_router(gridratio.router, prefix="/gridratio", tags=["gridratiodetails"])
api_router.include_router(management.router, prefix="/management", tags=["managementdetails"])
api_router.include_router(cultivar.router, prefix="/cultivars", tags=["cultivar"])
api_router.include_router(seasonal.router, prefix="/seasonalsim", tags=["seasonalsimmulation"])
api_router.include_router(simoutput.router, prefix="/seasonaloutput", tags=["seasonalsimmulationoutput"])
