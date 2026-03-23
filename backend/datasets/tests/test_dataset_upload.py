import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from datasets.models import Dataset
import io
import pandas as pd

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def data_owner(db):
    user = User.objects.create_user(
        username="owner_upload", email="upload@test.com", password="password123", role="DATA_OWNER"
    )
    return user

@pytest.mark.django_db
class TestDatasetUpload:
    def test_valid_csv_upload(self, api_client, data_owner):
        api_client.force_authenticate(user=data_owner)
        
        # Create a valid CSV buffer
        csv_data = "col1,col2\n1.5,2.0\n3.1,4.2"
        csv_file = SimpleUploadedFile("test.csv", csv_data.encode('utf-8'), content_type="text/csv")
        
        response = api_client.post(
            "/api/datasets/",
            {"name": "Valid Dataset", "original_file": csv_file},
            format="multipart"
        )
        
        assert response.status_code == 201
        assert response.data["status"] == "READY"
        assert response.data["rows_count"] == 2
        assert response.data["columns_count"] == 2
        
        dataset = Dataset.objects.get(id=response.data["id"])
        assert dataset.encrypted_file.name.endswith(".bin")

    def test_non_csv_rejection(self, api_client, data_owner):
        api_client.force_authenticate(user=data_owner)
        
        txt_file = SimpleUploadedFile("test.txt", b"some text", content_type="text/plain")
        
        response = api_client.post(
            "/api/datasets/",
            {"name": "Invalid Dataset", "original_file": txt_file},
            format="multipart"
        )
        
        assert response.status_code == 400
        assert "original_file" in response.data or "detail" in response.data # error can be in serializer or view

    def test_non_numeric_csv_rejection(self, api_client, data_owner):
        api_client.force_authenticate(user=data_owner)
        
        # CSV with strings
        csv_data = "col1,col2\n1.5,text\n3.1,more_text"
        csv_file = SimpleUploadedFile("invalid.csv", csv_data.encode('utf-8'), content_type="text/csv")
        
        response = api_client.post(
            "/api/datasets/",
            {"name": "Invalid Dataset", "original_file": csv_file},
            format="multipart"
        )
        
        assert response.status_code == 400
        assert "Encryption failed" in str(response.data)

    def test_empty_file_rejection(self, api_client, data_owner):
        api_client.force_authenticate(user=data_owner)
        
        empty_file = SimpleUploadedFile("empty.csv", b"", content_type="text/csv")
        
        response = api_client.post(
            "/api/datasets/",
            {"name": "Empty Dataset", "original_file": empty_file},
            format="multipart"
        )
        
        assert response.status_code == 400

    def test_large_file_rejection(self, api_client, data_owner):
        api_client.force_authenticate(user=data_owner)
        
        # 6MB file
        large_data = b"0" * (6 * 1024 * 1024)
        large_file = SimpleUploadedFile("large.csv", large_data, content_type="text/csv")
        
        response = api_client.post(
            "/api/datasets/",
            {"name": "Large Dataset", "original_file": large_file},
            format="multipart"
        )
        
        assert response.status_code == 400
        assert "File size must be under 5MB" in str(response.data)
