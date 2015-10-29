// classe inscription.

function Inscription() {
	this.signin = $('#inscription');
	this.userName = null;
	this.password = null;
};

Inscription.prototype = {
	stock: function() {
		this.signin.on('click', function() {
			
		});
	}
}