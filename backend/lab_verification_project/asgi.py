"""
ASGI config for lab_verification_project project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab_verification_project.settings')

application = get_asgi_application()
