from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        """Test that a user can be created successfully."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword123"
        )
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpassword123"))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_user_string_representation(self):
        """Test the string representation of the user model."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword123"
        )
        # Expected __str__ is email based on models.py
        self.assertEqual(str(user), "test@example.com")

    def test_create_superuser(self):
        """Test that a superuser can be created."""
        admin_user = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpassword123"
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)


#python manage.py test accounts