from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from lab_verification_project.verification.models import (
    Assignment, Submission, VerificationResult, TeacherReview, CodeComment
)
from lab_verification_project.verification.services import verify_submission
from .serializers import (
    AssignmentSerializer, SubmissionSerializer, SubmissionListSerializer,
    VerificationResultSerializer, TeacherReviewSerializer, CodeCommentSerializer
)

class IsTeacherOrAdmin(permissions.BasePermission):
    """Permission to allow only teachers and admins."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_teacher or request.user.is_admin
        )

class IsOwnerOrTeacher(permissions.BasePermission):
    """Permission to allow only the owner or teachers/admins."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_teacher or request.user.is_admin:
            return True
        
        # Check if the user is the owner of the submission
        if hasattr(obj, 'student'):
            return obj.student == request.user
        
        return False

class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment model."""
    
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    
    def get_permissions(self):
        """Return the permissions that the action should be enforced."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsTeacherOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for an assignment."""
        assignment = self.get_object()
        submissions = assignment.submissions.all()
        
        # Students can only see their own submissions
        if not (request.user.is_teacher or request.user.is_admin):
            submissions = submissions.filter(student=request.user)
        
        serializer = SubmissionListSerializer(submissions, many=True)
        return Response(serializer.data)

class SubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for Submission model."""
    
    queryset = Submission.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubmissionListSerializer
        return SubmissionSerializer
    
    def get_permissions(self):
        """Return the permissions that the action should be enforced."""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrTeacher]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Get the queryset based on the user role."""
        if self.request.user.is_teacher or self.request.user.is_admin:
            return Submission.objects.all()
        return Submission.objects.filter(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a submission."""
        submission = self.get_object()
        
        # Check if the submission has already been verified
        if hasattr(submission, 'verification_result'):
            return Response(
                {'detail': 'Submission has already been verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the submission
        verification_data = verify_submission(submission)
        
        # Create the verification result
        verification_result = VerificationResult.objects.create(
            submission=submission,
            **verification_data
        )
        
        # Update the submission status
        submission.status = 'verified'
        submission.save()
        
        serializer = VerificationResultSerializer(verification_result)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Add a teacher review to a submission."""
        submission = self.get_object()
        
        # Check if the user is a teacher
        if not (request.user.is_teacher or request.user.is_admin):
            return Response(
                {'detail': 'Only teachers can review submissions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the submission has already been reviewed
        if hasattr(submission, 'teacher_review'):
            return Response(
                {'detail': 'Submission has already been reviewed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the serializer with the submission context
        serializer = TeacherReviewSerializer(
            data=request.data,
            context={'request': request, 'submission_id': submission.id}
        )
        
        if serializer.is_valid():
            review = serializer.save()
            
            # Update the submission status
            submission.status = 'reviewed'
            submission.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """Add a code comment to a submission."""
        submission = self.get_object()
        
        # Check if the user is a teacher
        if not (request.user.is_teacher or request.user.is_admin):
            return Response(
                {'detail': 'Only teachers can add code comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create the serializer with the submission context
        serializer = CodeCommentSerializer(
            data=request.data,
            context={'request': request, 'submission_id': submission.id}
        )
        
        if serializer.is_valid():
            comment = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CodeCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for CodeComment model."""
    
    queryset = CodeComment.objects.all()
    serializer_class = CodeCommentSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        """Get the queryset filtered by submission if provided."""
        queryset = super().get_queryset()
        submission_id = self.request.query_params.get('submission')
        if submission_id:
            queryset = queryset.filter(submission_id=submission_id)
        return queryset
