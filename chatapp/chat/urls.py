from django.urls import path
from .views import (
    RegisterView, LoginView, UserListView,
    MessageListCreateView, UserMessageView,
    CustomTokenObtainPairView, MessageDeleteView,
    MessageEditView, MessageFileDownloadView, ProfileUpdateView,

)
urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(),
         name="token_obtain_pair"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('conversation/', UserMessageView.as_view(), name='user-message-view'),
    path('messages/<int:pk>/delete/', MessageDeleteView.as_view(),
         name="delete-message-view"),
    path('messages/<int:pk>/edit/', MessageEditView.as_view(),
         name='update-message-view'),
    path('messages/<int:pk>/download/', MessageFileDownloadView.as_view(),
         name='download-message'),
    path('profile/', ProfileUpdateView.as_view(), name="profile"),

]
