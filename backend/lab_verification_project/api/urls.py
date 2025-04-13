from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, SubmissionViewSet, CodeCommentViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'comments', CodeCommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
