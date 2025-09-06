from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Message, Profile


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(
        source="sender.username", read_only=True)
    receiver_username = serializers.CharField(
        source="receiver.username", read_only=True)
    file_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "receiver", "text", "file", "file_url", "download_url",
                  "timestamp", "sender_username", "receiver_username"]
        read_only_fields = ["id", "sender", "timestamp"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return request.build_absolute_uri(obj.file.url)  # type: ignore
        return None

    def get_download_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return request.build_absolute_uri(reverse('download-message', args=[obj.id]))
        return None


class ProfileSerializer(serializers.ModelSerializer):
    # expose username to frontend, mapped to user.username
    username = serializers.CharField(
        source='user.username', allow_blank=True, required=False)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'profile_pic']

    def update(self, instance, validated_data):
        # validated_data may look like {'user': {'username': 'newname'}, 'profile_pic': <InMemoryUploadedFile>}
        user_data = validated_data.pop('user', None)
        if user_data and 'username' in user_data:
            new_username = user_data['username']
            instance.user.username = new_username
            instance.user.save()

        # now let ModelSerializer update the Profile fields (like profile_pic)
        return super().update(instance, validated_data)


class UserListSerializer(serializers.ModelSerializer):
    # 🔹 direct profile_pic expose kar diya, taaki frontend me easily access ho
    profile_pic = serializers.ImageField(
        source="profile.profile_pic", read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_pic']


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        Profile.objects.get_or_create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['user_id'] = user.id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data
