function get_data_model(model_name, this_obj) {
	$.ajax({
		type: "POST",
		url: "get_data/",
		data: 'model_name=' + model_name,
		success: function(data) {
			$('.model').css({"text-decoration": "none", "color": "#111111"});
			this_obj.css({"text-decoration": "underline", "color": "#5BD2EC"});
			table = '<table>';
			table += '<thead><tr>';

			json_data = jQuery.parseJSON(data.json_data)
			window.fields = data.model_fields;

			$(data.model_fields).each(function(index, value) {
				table += '<td>' + value[1] + '</td>';
			});

			table += '</tr></thead><tbody>';

			$(json_data).each(function() {
				table += '<tr>';
				data_model = $(this);
				data_model.attr('fields')['id'] = data_model.attr('pk');
				id = data_model.attr('pk');

				$(data.model_fields).each(function(index, field) {
					table += "<td ";

					if (field[0] != 'id') {
						table += " onclick='add_input($(this))'";
					}

					table += " ><span style='display: block;' class='text'>" + data_model.attr('fields')[field[0]] + "</span>";
					table += '<input data-id="' + field[2] + '" style="display: none;" class="input" value="' + data_model.attr('fields')[field[0]] + '"';

					if (field[2] == 'CharField') {
						table += ' type="text" ';
					} else if (field[2] == 'IntegerField' ) {
						table += ' type="number" ';
					} else if (field[2] == 'DateField') {
						table += ' type="text" id="datepicker_' + id + '" ';
					}

					table += " onchange='edit($(this), \"" + field[2] + "\", \"" + field[0] + "\", \"" + model_name + "\", " + id + ");' >";
					table += "</td>";
				});

				table += "</tr>";
			});

			table += '</tbody></table>';
			table += '<div class="add_row"><h3>Новая запись</h3><form>';

			table += '<input type="hidden" name="model_name" value="' + model_name + '" >';

			$(data.model_fields).each(function(index, field) {
				if (field[0] != 'id') {
					table += "<div class='field'>" + field[1] + '  ';

					table += "<input name='" + field[0] + "' data-id='" + field[2] + "' ";

					if (field[2] == 'CharField') {
						table += ' type="text" ';
					} else if (field[2] == 'IntegerField' ) {
						table += ' type="number" ';
					} else if (field[2] == 'DateField') {
						table += ' type="text" id="datepicker_add" ';
					}
					table += '></div>';
				}
			});

			table += "<a class='button right' onclick='add($(this), \"" + model_name + "\");' >Добавить</a></form>";

			table += '</div>';
			$('.model_data').html(table);
			$('input[id^="datepicker_"]').datepicker({dateFormat: 'yy-mm-dd'});
		}
	});
}

function add(this_obj, model_name) {
	var error = false;

	$(this_obj.parent().find('input')).each(function() {
		if ($(this).data('id') != undefined) {
			var obj = $(this);
			var value = obj.val();

			obj.parent().find(".error").remove();

			if (obj.data('id') == 'CharField') {
				if (value.length < 1 || value.length >= 255) {
					error = true;

					html_error = "<div class='error'>Строка должна быть в пределах от 1 до 255 символов.</div>";
					obj.after(html_error);
				}
			} else if (obj.data('id') == 'IntegerField') {
				if (isFinite(parseInt(value, 10)) == false || value < 0 || value == '') {
					error = true;

					if (value < 0) {
						html_error = "<div class='error'>Число не должно быть меньше 0.</div>";
						obj.after(html_error);
					} else {
						html_error = "<div class='error'>Число должно быть целым.</div>";
						obj.after(html_error);
					}
				}
			} else if (obj.data('id') == 'DateField') {
				pattern = '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$'

				if (value.search(pattern) == -1) {
					error = true;
					
					html_error = "<div class='error'>Невереный формат, пример: 2014-06-16</div>";
					obj.after(html_error);
				}
			}
		}
	});

	if (error == true) {
		return false;
	}

	this_obj.parent().find(".error").remove();

	$.ajax({
		type: 'POST',
		url: 'add/',
		data: this_obj.parent().serialize(),
		success: function(data) {
			row = '<tr>';

			$(data).each(function() {
				data_model = $(this);
				data_model.attr('fields')['id'] = data_model.attr('pk');
				id = data_model.attr('pk');

				$(window.fields).each(function(index, field) {
					row += "<td ";

					if (field[0] != 'id') {
						row += " onclick='add_input($(this))'";
					}

					row += " ><span style='display: block;' class='text'>" + data_model.attr('fields')[field[0]] + "</span>";
					row += '<input data-id="' + field[2] + '" style="display: none;" class="input" value="' + data_model.attr('fields')[field[0]] + '"';

					if (field[2] == 'CharField') {
						row += ' type="text" ';
					} else if (field[2] == 'IntegerField' ) {
						row += ' type="number" ';
					} else if (field[2] == 'DateField') {
						row += ' type="text" id="datepicker_' + id + '" ';
					}

					row += " onchange='edit($(this), \"" + field[2] + "\", \"" + field[0] + "\", \"" + model_name + "\", " + id + ");' >";
					row += "</td>";
				});
			});

			row += '</tr>';
			$('.model_data > table > tbody').append(row);
			$('input[id^="datepicker_"]').datepicker({dateFormat: 'yy-mm-dd'});
		}
	});
}

function get_error(obj) {
	var value = obj.val();
	var error = false;

	obj.parent().find(".error").remove();

	if (obj.data('id') == 'CharField') {
		if (value.length < 1 || value.length >= 255) {
			error = true;

			html_error = "<div class='error'>Строка должна быть в пределах от 1 до 255 символов.</div>";
			obj.after(html_error);
		}
	} else if (obj.data('id') == 'IntegerField') {
		if (isFinite(parseInt(value, 10)) == false || value < 0 || value == '') {
			error = true;

			if (value < 0) {
				html_error = "<div class='error'>Число не должно быть меньше 0.</div>";
				obj.after(html_error);
			} else {
				html_error = "<div class='error'>Число должно быть целым.</div>";
				obj.after(html_error);
			}
		}
	} else if (obj.data('id') == 'DateField') {
		pattern = '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$'

		if (value.search(pattern) == -1) {
			error = true;
			
			html_error = "<div class='error'>Невереный формат, пример: 2014-06-16</div>";
			obj.after(html_error);
		}
	}

	return error;
}

function add_input(this_obj, field_type, field_name, model_name, id) {
	if (this_obj.find('.text').is(":visible") == true) {
		this_obj.find('.text').css("display", "none");
		this_obj.find('.input').css("display", "block");
	}
}

function edit(this_obj, field_type, field_name, model_name, id) {
	var value = this_obj.val()

	if (get_error(this_obj) == true) {
		return false;
	}

	this_obj.parent().find(".error").remove();

	$.ajax({
		type: "POST",
		url: "edit/",
		data: "model_name=" + model_name + "&field_name=" + field_name + "&value=" + value + "&id=" + id,
		success: function(data) {
			this_obj.parent().find('.input').css("display", "none");
			this_obj.parent().find('.text').text(value);
			this_obj.parent().find('.text').css("display", "block");
		}
	});
}

var csrftoken = $.cookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});
