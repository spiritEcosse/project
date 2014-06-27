from django.contrib import admin
from django.db import models
from django.utils import timezone
import yaml

# Create your models here.

def create_models():
	data = yaml.load(open("app/yaml/data.yaml"))
	model_all = {}

	for model_name, attr in data.items():
		class Meta:
			pass

		setattr(Meta, 'verbose_name', attr['title'])
		setattr(Meta, 'verbose_name_plural', attr['title'])

		fields = {'__module__': __name__, 'Meta': Meta, }
		fields_list = []

		for data_fields in attr['fields']:
			fields_list.append(data_fields['id'])
			field_type = None

			if data_fields['type'] == 'int':
				field_type = models.IntegerField(data_fields['title'], default = 0)
			elif data_fields['type'] == 'date':
				field_type = models.DateField(data_fields['title'], default = timezone.now())
			elif data_fields['type'] == 'char':
				field_type = models.CharField(data_fields['title'], max_length = 255)

			if field_type != None:
				fields[data_fields['id']] = field_type

		model = type(model_name, (models.Model,), fields)
		model_all[attr['title']] = model_name

		class Admin(admin.ModelAdmin):
			fields = fields_list
			list_display = tuple(fields_list)

		try:
			admin.site.register(model, Admin)
		except:
			pass

	return model_all

create_models()

