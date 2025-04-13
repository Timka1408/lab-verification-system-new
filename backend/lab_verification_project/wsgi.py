"""
WSGI config for lab_verification_project project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab_verification_project.settings')

application = get_wsgi_application()
