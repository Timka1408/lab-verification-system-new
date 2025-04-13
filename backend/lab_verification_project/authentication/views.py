from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """View for user registration."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user profile."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    """View for changing password."""
    
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)

class UserListView(generics.ListAPIView):
    """View for listing users (teachers only)."""
    
    serializer_class = UserSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_teacher or user.is_admin:
            # Teachers can see students
            if self.request.query_params.get('role') == 'student':
                return User.objects.filter(role='student')
            # Admins can see everyone
            elif user.is_admin:
                return User.objects.all()
        return User.objects.none()  # Return empty queryset for unauthorized users
