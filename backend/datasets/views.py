class DatasetUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES["file"]

        dataset = Dataset.objects.create(
            user=request.user,
            name=file.name,
            original_file=file
        )

        return Response({"dataset_id": dataset.id})
