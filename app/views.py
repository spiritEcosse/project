from django.shortcuts import render
from app.models import create_models
from django.http import HttpResponseRedirect, HttpResponse, QueryDict
from django.core.urlresolvers import reverse
from django.views import generic
from django.db.models import get_app, get_models, get_model
from django.core import serializers
import json
from django.utils import simplejson

# Create your views here.

class IndexView(generic.ListView):
	template_name = 'app/index.html'
	context_object_name = 'models'
	app = get_app('app')
	models = get_models(app)
	queryset = {model.__name__: model._meta.verbose_name for model in models}

def get_data(request):
	model_name = request.POST['model_name']
	model = get_model('app', model_name)

	model_fields = [(field.name, field.verbose_name, field.get_internal_type()) for field in model._meta.fields]
	model_data = model.objects.all().order_by('id')
	model_data = serializers.serialize('json', model_data)
	result = json.dumps({'model_fields': model_fields, 'json_data': model_data})

	return HttpResponse(result, content_type="application/json; charset=utf8")

def edit(request):
	model_name = request.POST['model_name']
	field_name = request.POST['field_name']
	value = request.POST['value']
	pk = request.POST['id']

	model = get_model('app', model_name)
	model_obj = model.objects.get(pk=pk)
	setattr(model_obj, field_name, value)
	model_obj.save()
	return HttpResponse(request)

def add(request):
	model_name = request.POST['model_name']
	model = get_model('app', model_name)
	model = model()

	for field_name, value in request.POST.items():
		setattr(model, field_name, value)

	model.save()
	return HttpResponse(request)
