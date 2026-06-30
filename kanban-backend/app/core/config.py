from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongo_uri: str
    mongo_db_name: str = "kanbix"

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # CORS
    frontend_url: str = "http://localhost:5173"

    # Email
    resend_api_key: str = ""
    resend_from_email: str = "onboarding@resend.dev"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
