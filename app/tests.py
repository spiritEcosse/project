from django.test import TestCase
from django.db import models
from django.db.models import get_app, get_models, get_model
from app.models import create_models

# Create your tests here.

class AppModelTest(TestCase):
	def test_create_model(self):
		app = get_app('app')
		self.assertQuerysetEqual(get_models(app), create_models())
