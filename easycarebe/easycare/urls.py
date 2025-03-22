from django.urls import path
from . import views

urlpatterns = [
    path('getmemo/', views.getListMemo, name='getListMemo'),
    path('insmemo/', views.insMemo, name='insMemo'),
    path('send-help-message/', views.send_help_message, name='send_help_message'),
    path('getListCalendar/', views.getListCalendar, name='getListCalendar'),
    path('heart-rate/', views.heart_rate, name='heart_rate'),
    path('heart-data/', views.heart_rate_data, name='heart_rate_data'),
    path('heart-check/', views.heart_rate_check, name='heart_rate_check'),
]