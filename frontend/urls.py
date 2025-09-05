from django.urls import path
from . import views

urlpatterns = [
    path('', views.index ),
    path('getpackage', views.GetPackage.as_view(), name='getpackage')
]
