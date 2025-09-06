import os
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import Http404, FileResponse
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Message, Profile
from .serializers import (CustomTokenObtainPairSerializer, MessageSerializer,
                          UserListSerializer, UserRegisterSerializer, ProfileSerializer,
                          serializers)


# JWT Token Helper

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# User Registration

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


# User Login

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            tokens = get_tokens_for_user(
                user)
            return Response({
                'user_id': user.id,               # type: ignore[attr-defined]
                'username': user.username,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# List all users (except current)

class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # type: ignore[attr-defined]
        return User.objects.exclude(id=self.request.user.id)


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.GET.get('user_id')
        if user_id:
            try:
                other_user = User.objects.get(id=user_id)
            except User.DoesNotExist:                 # pylint: disable=no-member
                return Message.objects.none()         # pylint: disable=no-member
            return Message.objects.filter(           # pylint: disable=no-member
                Q(sender=self.request.user, receiver=other_user) |
                Q(sender=other_user, receiver=self.request.user)
            ).order_by('timestamp')

        return Message.objects.filter(           # pylint: disable=no-member
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('timestamp')

    def perform_create(self, serializer):

        receiver_id = self.request.data.get(         # pylint: disable=no-member
            'receiver')
        if not receiver_id:
            raise serializers.ValidationError("Receiver id is required.")

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:         # pylint: disable=no-member
            raise serializers.ValidationError("Receiver does not exist.")

        if receiver == self.request.user:
            raise serializers.ValidationError(
                "You cannot send a message to yourself.")

        serializer.save(sender=self.request.user)

    def get_serializer_context(self):
        return {"request": self.request}


class UserMessageView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user1 = self.request.GET.get('user1')
        user2 = self.request.GET.get('user2')

        # Validate user IDs
        if not user1 or not user2:
            return Message.objects.none()   # pylint: disable=no-member

        try:
            u1 = User.objects.get(id=user1)
            u2 = User.objects.get(id=user2)
        except User.DoesNotExist:           # pylint: disable=no-member
            return Message.objects.none()   # pylint: disable=no-member

        # Messages between the two users
        return Message.objects.filter(          # pylint: disable=no-member
            Q(sender=u1, receiver=u2) | Q(sender=u2, receiver=u1)
        ).order_by('timestamp')                # pylint: disable=no-member


class MessageDeleteView(generics.DestroyAPIView):
    queryset = Message.objects.all()                # pylint: disable=no-member
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(sender=self.request.user)


class MessageEditView(generics.UpdateAPIView):
    queryset = Message.objects.all()            # pylint: disable=no-member
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(sender=self.request.user)


class MessageFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        try:
            msg = Message.objects.get(pk=pk)    # pylint: disable=no-member
        except Message.DoesNotExist:            # pylint: disable=no-member
            raise Http404

        if msg.sender != request.user and msg.receiver != request.user:
            return Response({"detail": "Not Allowed"}, status=403)

        if not msg.file:
            return Response({"detail": "No File"}, status=404)

        file_path = msg.file.path
        filename = os.path.basename(file_path)
        return FileResponse(open(file_path, "rb"), as_attachment=True, filename=filename)


class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(
            user=self.request.user)
        return profile
