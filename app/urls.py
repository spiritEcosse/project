from django.conf.urls import patterns, url
from app import views

urlpatterns = patterns('',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^get_data/$', views.get_data, name='get_data'),
    url(r'^edit/$', views.edit, name='edit'),
    url(r'^add/$', views.add, name='add'),
    )