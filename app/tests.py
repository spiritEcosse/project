from django.test import TestCase
from django.db import models
from django.db.models import get_app, get_models, get_model
from app.models import create_models
from django.core.urlresolvers import reverse
import json
from django.core import serializers

# Create your tests here.

def factory_model(model, list_fields):
	number = 1000
	string = 'name 1'
	date = '2012-12-12'

	model_obj = model()

	for field in list_fields:
		if field.get_internal_type() != 'AutoField':
			if field.get_internal_type() == 'IntegerField':
				value = number
			elif field.get_internal_type() == 'CharField':
				value = string
			elif field.get_internal_type() == 'DateField':
				value = date

			setattr(model_obj, field.name, value)
		
	model_obj.save()
	return model_obj

class AppModelTest(TestCase):
	def test_create_model(self):
		app = get_app('app')
		self.assertQuerysetEqual(get_models(app), create_models())

	def test_get_data(self):
		kwargs = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}
		app = get_app('app')
		list_models = get_models(app)

		for model in list_models:
			model_fields = [(field.name, field.verbose_name, field.get_internal_type()) for field in model._meta.fields]
			model_data = model.objects.all().order_by('id')
			model_data = serializers.serialize('json', model_data)

			result = json.dumps({'json_data': model_data, 'model_fields': model_fields})
			result = json.loads(result)

			response = self.client.post(reverse('app:get_data', args=()), {'model_name': model.__name__}, **kwargs)
			json_loads = json.loads(response.content)

			self.assertEqual(response.status_code, 200)
			self.assertQuerysetEqual(json_loads, result)

	def test_edit(self):
		kwargs = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}
		app = get_app('app')
		list_models = get_models(app)

		number = 1000
		string = 'name 1'
		date = '2012-12-12'

		for model in list_models:
			data = {'model_name': model.__name__}
			model_obj = factory_model(model, model._meta.fields)
			data['id'] = model_obj.id

			for field in model._meta.fields:
				if field.get_internal_type() != 'AutoField':
					data['field_name'] = field.name

					if field.get_internal_type() == 'IntegerField':
						value = number
					elif field.get_internal_type() == 'CharField':
						value = string
					elif field.get_internal_type() == 'DateField':
						value = date

					data['value'] = value
					response = self.client.post(reverse('app:edit', args=()), data, **kwargs)
					self.assertEqual(response.status_code, 200)

	def test_add(self):
		kwargs = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}
		app = get_app('app')
		list_models = get_models(app)
		
		number = 1000
		string = 'name 1'
		date = '2012-12-12'

		for model in list_models:
			data = {'model_name': model.__name__}

			for field in model._meta.fields:
				if field.get_internal_type() != 'AutoField':
					if field.get_internal_type() == 'IntegerField':
						value = number
					elif field.get_internal_type() == 'CharField':
						value = string
					elif field.get_internal_type() == 'DateField':
						value = date

					data[field.name] = value

			response = self.client.post(reverse('app:add', args=()), data, **kwargs)
			self.assertEqual(response.status_code, 200)