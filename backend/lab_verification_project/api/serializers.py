from rest_framework import serializers
from django.contrib.auth import get_user_model
from lab_verification_project.verification.models import (
    Assignment, Submission, VerificationResult, TeacherReview, CodeComment
)

User = get_user_model()

class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Assignment model."""
    
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'created_by', 'created_by_name', 'created_at', 'deadline']
        read_only_fields = ['id', 'created_by', 'created_at']
    
    def get_created_by_name(self, obj):
        return obj.created_by.full_name
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class CodeCommentSerializer(serializers.ModelSerializer):
    """Serializer for CodeComment model."""
    
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CodeComment
        fields = ['id', 'line_number', 'comment', 'teacher', 'teacher_name', 'created_at']
        read_only_fields = ['id', 'teacher', 'created_at']
    
    def get_teacher_name(self, obj):
        return obj.teacher.full_name
    
    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        validated_data['submission_id'] = self.context.get('submission_id')
        return super().create(validated_data)

class VerificationResultSerializer(serializers.ModelSerializer):
    """Serializer for VerificationResult model."""
    
    class Meta:
        model = VerificationResult
        fields = [
            'id', 'syntax_check_passed', 'syntax_errors', 
            'plagiarism_score', 'plagiarism_details', 'verified_at'
        ]
        read_only_fields = ['id', 'verified_at']

class TeacherReviewSerializer(serializers.ModelSerializer):
    """Serializer for TeacherReview model."""
    
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TeacherReview
        fields = ['id', 'comments', 'grade', 'teacher', 'teacher_name', 'reviewed_at']
        read_only_fields = ['id', 'teacher', 'reviewed_at']
    
    def get_teacher_name(self, obj):
        return obj.teacher.full_name
    
    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        validated_data['submission_id'] = self.context.get('submission_id')
        return super().create(validated_data)

class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for Submission model."""
    
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.SerializerMethodField()
    verification_result = VerificationResultSerializer(read_only=True)
    teacher_review = TeacherReviewSerializer(read_only=True)
    code_comments = CodeCommentSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'file', 'file_url', 'submitted_at', 'status',
            'verification_result', 'teacher_review', 'code_comments'
        ]
        read_only_fields = ['id', 'student', 'submitted_at', 'status']
    
    def get_student_name(self, obj):
        return obj.student.full_name
    
    def get_assignment_title(self, obj):
        return obj.assignment.title
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class SubmissionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing submissions."""
    
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.SerializerMethodField()
    has_verification = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'submitted_at', 'status', 'has_verification', 'has_review'
        ]
    
    def get_student_name(self, obj):
        return obj.student.full_name
    
    def get_assignment_title(self, obj):
        return obj.assignment.title
    
    def get_has_verification(self, obj):
        return hasattr(obj, 'verification_result')
    
    def get_has_review(self, obj):
        return hasattr(obj, 'teacher_review')
