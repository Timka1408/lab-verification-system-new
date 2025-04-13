import os
import subprocess
import tempfile
import shutil
import textdistance
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class SyntaxChecker:
    """Class for checking syntax of code files."""
    
    @staticmethod
    def check_python(file_path):
        """Check Python syntax using pylint."""
        try:
            result = subprocess.run(
                ['pylint', '--errors-only', file_path],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                return True, "No syntax errors found."
            else:
                return False, result.stdout or result.stderr
        except Exception as e:
            logger.error(f"Error checking Python syntax: {str(e)}")
            return False, f"Error checking syntax: {str(e)}"
    
    @staticmethod
    def check_cpp(file_path):
        """Check C++ syntax using g++ compiler."""
        try:
            result = subprocess.run(
                ['g++', '-fsyntax-only', file_path],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode == 0:
                return True, "No syntax errors found."
            else:
                return False, result.stderr
        except Exception as e:
            logger.error(f"Error checking C++ syntax: {str(e)}")
            return False, f"Error checking syntax: {str(e)}"
    
    @classmethod
    def check_file(cls, file_path):
        """Check syntax based on file extension."""
        _, extension = os.path.splitext(file_path)
        extension = extension.lower()
        
        if extension == '.py':
            return cls.check_python(file_path)
        elif extension in ['.cpp', '.cc', '.cxx', '.c++']:
            return cls.check_cpp(file_path)
        else:
            return True, "File type not supported for syntax checking."

class PlagiarismChecker:
    """Class for checking plagiarism in code files."""
    
    @staticmethod
    def check_code_similarity(file_path, reference_files):
        """
        Check code similarity using textdistance.
        
        Args:
            file_path: Path to the file to check
            reference_files: List of paths to reference files
            
        Returns:
            float: Similarity score (0-100)
            str: Details of the similarity check
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                submission_code = f.read()
            
            max_similarity = 0
            similar_file = None
            details = []
            
            for ref_file in reference_files:
                try:
                    with open(ref_file, 'r', encoding='utf-8') as f:
                        reference_code = f.read()
                    
                    # Calculate similarity using Jaccard similarity
                    similarity = textdistance.jaccard.normalized_similarity(
                        submission_code, reference_code
                    ) * 100
                    
                    details.append(f"Similarity with {os.path.basename(ref_file)}: {similarity:.2f}%")
                    
                    if similarity > max_similarity:
                        max_similarity = similarity
                        similar_file = os.path.basename(ref_file)
                except Exception as e:
                    logger.error(f"Error processing reference file {ref_file}: {str(e)}")
            
            if max_similarity > 0:
                details.append(f"Highest similarity ({max_similarity:.2f}%) found with {similar_file}")
            
            return max_similarity, "\n".join(details)
        except Exception as e:
            logger.error(f"Error checking code similarity: {str(e)}")
            return 0, f"Error checking similarity: {str(e)}"
    
    @staticmethod
    def prepare_moss_submission(file_path, temp_dir):
        """Prepare a file for MOSS submission."""
        # This is a placeholder for MOSS integration
        # MOSS requires an account and a specific submission format
        # For now, we'll just copy the file to a temporary directory
        try:
            filename = os.path.basename(file_path)
            dest_path = os.path.join(temp_dir, filename)
            shutil.copy2(file_path, dest_path)
            return dest_path
        except Exception as e:
            logger.error(f"Error preparing MOSS submission: {str(e)}")
            return None
    
    @classmethod
    def check_plagiarism(cls, file_path, reference_files):
        """
        Check plagiarism using available methods.
        
        For a complete implementation, you would need to integrate with MOSS:
        https://theory.stanford.edu/~aiken/moss/
        
        Args:
            file_path: Path to the file to check
            reference_files: List of paths to reference files
            
        Returns:
            float: Plagiarism score (0-100)
            str: Details of the plagiarism check
        """
        # For now, we'll use textdistance for similarity checking
        return cls.check_code_similarity(file_path, reference_files)

def verify_submission(submission):
    """
    Verify a submission by checking syntax and plagiarism.
    
    Args:
        submission: Submission model instance
        
    Returns:
        dict: Verification results
    """
    # Create a temporary directory for verification
    temp_dir = tempfile.mkdtemp(dir=settings.VERIFICATION_TEMP_DIR)
    
    try:
        # Get the file path
        file_path = submission.file.path
        
        # Check syntax
        syntax_passed, syntax_errors = SyntaxChecker.check_file(file_path)
        
        # Get reference files (other submissions for the same assignment)
        reference_files = []
        for ref_submission in submission.assignment.submissions.exclude(id=submission.id):
            reference_files.append(ref_submission.file.path)
        
        # Check plagiarism
        plagiarism_score, plagiarism_details = PlagiarismChecker.check_plagiarism(
            file_path, reference_files
        )
        
        # Return the results
        return {
            'syntax_check_passed': syntax_passed,
            'syntax_errors': syntax_errors,
            'plagiarism_score': plagiarism_score,
            'plagiarism_details': plagiarism_details,
        }
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
