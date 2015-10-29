(function (window, $) {
	'use strict'

	const API_ROOT_URL = "http://greenvelvet.alwaysdata.net/kwick/api";
	
	var $pseudo       =  $('#pseudo'),
		$mdp          =  $('#password'),
		
		$pseudo2      =  $('#pseudo2'),
		$mdp2         =  $('#password2'),
		$inscription  =  $('#inscription'),
		$connexion    =  $('#connexion'),
		$deconnection =  $('#deconnexion'),
		$send         =  $('#send'),
		
		tchat         = 'tchat.html',
		connection    = 'connexion.html';


	function CallKwickAPI(url, cd) {
		var request = $.ajax ({
			type: 'GET',
			dataType: 'jsonp',
			url: API_ROOT_URL + url
			
		});

		// En cas d'erreur...
		request.fail(function (jqXHR, textStatus, errorThrown) {
			cd(textStatus, null);
		});

		// En cas de succes...
		request.done(function(data) {
			cd(null, data);
		});
	}

	var app = {
		user_name: '',
		password: '',
		user_name2: '',
		password2: '',

		initialize: function() {
			$inscription.on('submit', function (e) {
				e.preventDefault();

				app.user_name = $pseudo.val();
				app.password  = $mdp.val();

				app.register( app.user_name, app.password );
			});

			$connexion.on('submit', function (e) {
				e.preventDefault();

				app.user_name2 = $pseudo2.val();
				app.password2  = $mdp2.val();

				app.login( app.user_name2, app.password2 );
			});
		},

		initializeTchat: function () {
			app.verification();

			$deconnection.on('click', function (e) {
				e.preventDefault();
				app.deconnection(localStorage.getItem('token'), localStorage.getItem('id'));
			});
		},

		// fonction d'inscription
		register: function(user_name, password) {
			CallKwickAPI("/signup/" + user_name + "/" + password, function(err, data) {
				if (err) {
					return alert(err);
				}

				localStorage.setItem('login', user_name);
				localStorage.setItem('token', data.result.token);
				localStorage.setItem('id', data.result.id);
				window.location = tchat;

			});
		},

		// fonction d'connexion
		login: function(user_name, password) {
			CallKwickAPI("/login/" + user_name + "/" + password, function(err, data) {
				if (err) {
					return alert(err);
				}

				localStorage.setItem('login', user_name);
				localStorage.setItem('token', data.result.token);
				localStorage.setItem('id', data.result.id);
				window.location = tchat;
			});
		},

		verification: function() {
			var login = localStorage.getItem('login');
			var token = localStorage.getItem('token');
			var id = localStorage.getItem('id');

			if (!login || !token || !id) {
				return window.location = connection;
			}
		},

		deconnection: function(token, id) {
			CallKwickAPI("/logout/" + token + "/" + id, function(err, data) {
				if (err) {
					return alert(err);
				}

				localStorage.removeItem('login');
				localStorage.removeItem('token');
				localStorage.removeItem('id');

				window.location = connection;
			});
		},

		randColor: function() {
		    return "#" + (~~(Math.random()*(1<<24))).toString(16);
		},
		

		userLogged: function(token) {
			var token = localStorage.getItem('token');
			CallKwickAPI("/user/logged/" + token, function(err, data) {
				if (err) {
					return alert(err);
				}

				for (var i = 0; i < data.result.user.length ; i++ ) {
					var $div = $('<div class="clr"></div>');
						$div.css('background-color', app.randColor() );
					var $li = $(
						'<li>'+ '<p class="name">' + data.result.user[i] + '</p>' +'</li>'
					);
					$li.prepend( $div );

					$('#people').append( $li ).scroll(10*100000000000000);
				};
			});
		},

		sendMessage: function() {
			$send.on('click', function() {
				var token   = localStorage.getItem('token');
				var id      = localStorage.getItem('id');
				var message = localStorage.getItem('message');

				app.createMessage(token, id, message);
				$('#message').val('');
			});
		},

		createMessage: function(token, id, message) {
			var token   = localStorage.getItem('token');
			var id      = localStorage.getItem('id');
			var message = encodeURIComponent($('#message').val());
			
			CallKwickAPI("/say/" + token + '/' + id + '/' + message, function(err, data) {
				if (err) {
					return alert(err);
				}
			});
		},

		getTalk: function(token) {
			var token   = localStorage.getItem('token');
			CallKwickAPI("/talk/list/" + token + '/' + 0, function(err, data) {
				if (err) {
					return alert(err);
				}

				for (var i = 0; i < data.result.talk.length ; i++ ) {
					$('#messageSend').append(
						'<h2 class="title2">' + data.result.talk[i].user_name + '</h2>'+
						'<p class="users">' + data.result.talk[i].content + '</p>'
					);
				};
			});
		},

	}//fin objet app

	window.app = app;

})(window, jQuery)

// local storage