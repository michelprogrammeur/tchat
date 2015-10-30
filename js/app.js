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
		
		brush         = '',
		tchat         = 'tchat.html',
		connection    = 'index.html';


	// Requête AJAX
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

		// Validation des formulaire d'INSCRIPTION et de CONNEXION
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
		// Evenement click déconnection
		initializeTchat: function () {
			app.verification();

			$deconnection.on('click', function (e) {
				e.preventDefault();
				app.deconnection(localStorage.getItem('token'), localStorage.getItem('id'));
			});
		},

		
		// Fonction d'inscription
		register: function(user_name, password) {
			CallKwickAPI("/signup/" + user_name + "/" + password, function(err, data) {
				if (err) {
					return alert(err);
				}else if(data.result.status === 'failure') {
					$('#error').empty();
					return $('#error').append('<p class="errorMessage"><i class="fa fa-times"></i><span>' + data.result.message + '</span></p>');
				}

				localStorage.setItem('login', user_name);
				localStorage.setItem('token', data.result.token);
				localStorage.setItem('id', data.result.id);
				window.location = tchat;

			});
		},
		// Fonction d'connexion
		login: function(user_name, password) {
			CallKwickAPI("/login/" + user_name + "/" + password, function(err, data) {
				if (err) {
					return alert(err);
				}else if(data.result.status === 'failure') {
					$('#error').empty();
					return $('#error').append('<p class="errorMessage"><i class="fa fa-times"></i><span>' + data.result.message + '</span></p>');
				}

				localStorage.setItem('login', user_name);
				localStorage.setItem('token', data.result.token);
				localStorage.setItem('id', data.result.id);
				window.location = tchat;
			});
		},


		// Empêche l'utilisateur de passer directement sur le chat par l'URL
		verification: function() {
			var login = localStorage.getItem('login'),
				token = localStorage.getItem('token'),
				id    = localStorage.getItem('id');

			if (!login || !token || !id) {
				return window.location = connection;
			}
		},


		// Bouton déconnexion 
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
		// Couleurs Random des utilisateurs
		randColor: function() {
		    return "#" + (~~(Math.random()*(1<<24))).toString(16);
		},


		// Les functions de la palette de couleur
		createColor: function() {
			var brushColor = [
				'#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', 
				'#9365B8', '#475577', '#41A85F', '#00A885',
				'#3D8EB9', '#2969B0', '#553982', '#28324E',

				'#F7DA64', '#FBA026', '#EB6B56', '#E25041', 
				'#A38F84', '#EFEFEF', '#FAC51C', '#F37934',
				'#D14841', '#B8312F', '#75706B', '#D1D5D8'
			];

			var $els = $('<div></div>');
			for (var i = 0; i < brushColor.length + 1; i++ ) {
				$els.clone().appendTo('#color');
				$els.removeClass().addClass('pen color' + i);
				$els.css('background-color', brushColor[i]);
			};
			$("#color").find('div').eq(0).remove();
		},
		chooseColor: function(brush) {
			$('#color').hide();
			$('#chooseColor').on('click', function() {
				$('#color').toggle();
			});
		},
		getColor: function() {
			$('#color').find('div').on('click', app.color );
		},
		color: function() {
			brush = $(this).css('background-color');
			return brush;
		},


		// Liste des utilisateurs
		userLogged: function(token) {
			var token = localStorage.getItem('token');
			CallKwickAPI("/user/logged/" + token, function(err, data) {
				if (err) {
					return alert(err);
				}
				$('#people').empty();
				for (var i = 0; i < data.result.user.length ; i++ ) {
					var $div = $('<div class="clr"></div>');
						$div.css('background-color', app.randColor() );
					var $li = $(
						'<li>'+ '<p class="name">' + data.result.user[i] + '</p><i class="fa fa-check"></i></li>'
					);
					$li.prepend( $div );

					$('#people').append( $li );
				};
			});
		},
		// Mes messages envoyés
		sendMessage: function() {
			$('#content').on('submit', function(e) {

				e.preventDefault();
				var token   = localStorage.getItem('token');
				var id      = localStorage.getItem('id');
				var message = localStorage.getItem('message');

				app.createMessage(token, id, message);

				setInterval(function() {
					app.getTalk();
				}, 100);

				$('#message').val('');
			});
		},
		// Forme Général des messages ( user_name, message )
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
		// Liste des messages
		getTalk: function(token) {
			var token   = localStorage.getItem('token');
			CallKwickAPI("/talk/list/" + token + '/' + 0, function(err, data) {
				if (err) {
					return alert(err);
				}

				$('#messageSend').empty();
				var myPseudo = localStorage.getItem('login');
				var tblSize = data.result.talk.length;
				for (var i = tblSize - 15 ; i < tblSize ; i++ ) {
					if(data.result.talk[i].user_name === myPseudo) {
						$('#messageSend').append(
							'<div class="container"><div class="colorMy"><h2 class="title3">' + data.result.talk[i].user_name + '</h2>'+
							'<p class="users">' + data.result.talk[i].content + '</p></div></div>'
						);
					}else {
						$('#messageSend').append(
							'<div class="container"><div class="colorContent"><h2 class="title2">' + data.result.talk[i].user_name + '</h2>'+
							'<p class="users">' + data.result.talk[i].content + '</p></div></div>'
						);
					}
				};
				$('.title3').css('background-color', brush );
				$('#messageSend').scrollTop(10000000000);
			});
		},
		
	}//fin objet app

	window.app = app;

})(window, jQuery)

// local storage