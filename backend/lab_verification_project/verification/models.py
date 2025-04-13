from django.db import models
from django.conf import settings
import os

class Assignment(models.Model):
    """Model representing a lab assignment."""
    
    title = models.CharField('Title', max_length=100)
    description = models.TextField('Description')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_assignments')
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    deadline = models.DateTimeField('Deadline', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Submission(models.Model):
    """Model representing a student's lab work submission."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('reviewed', 'Reviewed'),
    )
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField('File', upload_to='submissions/')
    submitted_at = models.DateTimeField('Submitted At', auto_now_add=True)
    status = models.CharField('Status', max_length=10, choices=STATUS_CHOICES, default='pending')
    
    class Meta:
        verbose_name = 'Submission'
        verbose_name_plural = 'Submissions'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.assignment.title}"
    
    @property
    def filename(self):
        return os.path.basename(self.file.name)
    
    @property
    def file_extension(self):
        _, extension = os.path.splitext(self.filename)
        return extension.lower()

class VerificationResult(models.Model):
    """Model representing the verification result of a submission."""
    
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='verification_result')
    syntax_check_passed = models.BooleanField('Syntax Check Passed', default=False)
    syntax_errors = models.TextField('Syntax Errors', blank=True)
    plagiarism_score = models.FloatField('Plagiarism Score', default=0.0)  # Percentage of similarity
    plagiarism_details = models.TextField('Plagiarism Details', blank=True)
    verified_at = models.DateTimeField('Verified At', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Verification Result'
        verbose_name_plural = 'Verification Results'
    
    def __str__(self):
        return f"Verification for {self.submission}"

class TeacherReview(models.Model):
    """Model representing a teacher's review of a submission."""
    
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='teacher_review')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    comments = models.TextField('Comments')
    grade = models.PositiveSmallIntegerField('Grade', null=True, blank=True)
    reviewed_at = models.DateTimeField('Reviewed At', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Teacher Review'
        verbose_name_plural = 'Teacher Reviews'
    
    def __str__(self):
        return f"Review for {self.submission}"

class CodeComment(models.Model):
    """Model representing a comment on a specific part of the code."""
    
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='code_comments')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='code_comments')
    line_number = models.PositiveIntegerField('Line Number')
    comment = models.TextField('Comment')
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Code Comment'
        verbose_name_plural = 'Code Comments'
        ordering = ['line_number']
    
    def __str__(self):
        return f"Comment on line {self.line_number} by {self.teacher.full_name}"
