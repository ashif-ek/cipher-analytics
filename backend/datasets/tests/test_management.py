from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from ..models import Dataset

User = get_user_model()

class DatasetManagementTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword123"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test dataset
        self.csv_content = b"col1,col2\n10,20\n30,40"
        self.test_file = SimpleUploadedFile(
            "test_dataset.csv",
            self.csv_content,
            content_type="text/csv"
        )
        self.dataset = Dataset.objects.create(
            user=self.user,
            name="Sample Dataset",
            original_file=self.test_file,
            status="encrypted"
        )

    def test_list_datasets(self):
        """Test listing datasets returns the user's datasets."""
        url = reverse('dataset-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Sample Dataset")
        self.assertEqual(response.data[0]['status'], "encrypted")

    def test_retrieve_dataset_detail(self):
        """Test retrieving a specific dataset detail."""
        url = reverse('dataset-detail', args=[self.dataset.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], "Sample Dataset")

    def test_delete_dataset(self):
        """Test deleting a dataset."""
        url = reverse('dataset-detail', args=[self.dataset.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Dataset.objects.count(), 0)

    def test_queryset_isolation(self):
        """Test that users can only see their own datasets."""
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="otherpassword123"
        )
        Dataset.objects.create(
            user=other_user,
            name="Other User's Dataset",
            original_file=self.test_file
        )
        
        url = reverse('dataset-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Sample Dataset")
