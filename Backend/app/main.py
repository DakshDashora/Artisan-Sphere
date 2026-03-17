
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from .database import Base, engine
from .routes import auth, product, api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://artisansphere.vercel.app"],
    allow_credentials=True,  
    allow_methods=["*"],     
    allow_headers=["*"],    
    
)

# ---------------- Create tables ----------------
Base.metadata.create_all(bind=engine)

# ---------------- Include routers ----------------
app.include_router(auth.router)
app.include_router(product.router)
app.include_router(api.router)
# ---------------- Custom OpenAPI ----------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="ArtisanSphere API",
        version="1.0.0",
        description="Artisan Sphere",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
