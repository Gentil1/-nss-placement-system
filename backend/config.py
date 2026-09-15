import os
from datetime import timedelta
from werkzeug.security import generate_password_hash

class Config:
    """Base configuration"""
    # Set a real SECRET_KEY environment variable in production. This
    # fallback is fine for local development only.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///nss_placement.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # Real admin authentication — password is never stored or compared in
    # plaintext, only its hash. Override via environment variables in
    # production (ADMIN_EMAIL, ADMIN_PASSWORD).
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@nss.com')
    ADMIN_PASSWORD_HASH = os.environ.get(
        'ADMIN_PASSWORD_HASH',
        generate_password_hash(os.environ.get('ADMIN_PASSWORD', 'admin123'))
    )
    ADMIN_SESSION_LIFETIME = timedelta(hours=12)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
