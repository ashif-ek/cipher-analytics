import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from datasets.models import Dataset
from analytics.models import Computation

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def data_owner(db):
    user = User.objects.create_user(
        username="owner", email="owner@test.com", password="password123", role="DATA_OWNER"
    )
    return user

@pytest.fixture
def researcher(db):
    user = User.objects.create_user(
        username="researcher", email="researcher@test.com", password="password123", role="RESEARCHER"
    )
    return user

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        username="admin", email="admin@test.com", password="password123", role="ADMIN"
    )
    return user

@pytest.mark.django_db
class TestRBAC:
    def test_data_owner_cannot_see_others_datasets(self, api_client, data_owner):
        # Create user B
        user_b = User.objects.create_user(
            username="user_b", email="user_b@test.com", password="password"
        )
        Dataset.objects.create(owner=user_b, name="Secret B")
        
        api_client.force_authenticate(user=data_owner)
        response = api_client.get("/api/datasets/")
        
        assert response.status_code == 200
        assert len(response.data) == 0

    def test_researcher_cannot_POST_dataset(self, api_client, researcher):
        api_client.force_authenticate(user=researcher)
        response = api_client.post("/api/datasets/", {"name": "Test"})
        assert response.status_code == 403

    def test_researcher_can_see_shared_datasets(self, api_client, researcher, data_owner):
        Dataset.objects.create(owner=data_owner, name="Shared Data", is_shared_for_research=True)
        Dataset.objects.create(owner=data_owner, name="Private Data", is_shared_for_research=False)
        
        api_client.force_authenticate(user=researcher)
        response = api_client.get("/api/datasets/")
        
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Shared Data"

    def test_researcher_cannot_access_raw_computation(self, api_client, researcher, data_owner):
        comp = Computation.objects.create(
            owner=data_owner, 
            dataset=Dataset.objects.create(owner=data_owner, name="D1"),
            result={"raw": "hidden"},
            is_aggregated=False
        )
        
        api_client.force_authenticate(user=researcher)
        response = api_client.get(f"/api/analytics/computations/{comp.id}/")
        assert response.status_code == 404 # filtered out from queryset

    def test_researcher_can_access_aggregated_summary(self, api_client, researcher, data_owner):
        ds = Dataset.objects.create(owner=data_owner, name="Analytic Target", rows=100)
        api_client.force_authenticate(user=researcher)
        response = api_client.get(f"/api/analytics/computations/summary/?dataset_id={ds.id}")
        
        assert response.status_code == 200
        assert "average" in response.data
        assert "dataset_name" in response.data
        assert "owner" not in response.data # Anonymized
