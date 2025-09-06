from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Message(models.Model):
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="uploads/", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}->{self.receiver}: {self.text or self.file.name}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(
        upload_to="profile_pics/", null=True, blank=True)
    about = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username
