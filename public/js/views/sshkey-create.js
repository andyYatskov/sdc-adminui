define(function(require) {
    var SSHKey = require('models/sshkey');

    return Backbone.Marionette.ItemView.extend({
        className: 'modal',
        template: require('text!tpl/sshkey-create.html'),
        events: {
            'click button.save': 'onClickSave'
        },
        modelEvents: {
            'sync': 'onModelSync',
            'error': 'onModelError'
        },

        initialize: function(options) {
            if (typeof(options.user) !== 'string') {
                throw new TypeError('options.user {string} required');
            }
            
            this.model = new SSHKey({user:options.user});
        },

        onModelSync: function(model) {
            this.trigger('saved', model);
            this.$el.modal('hide').remove();
        },

        onModelError: function(model, xhr, error) {
            this.$(".alert").html(xhr.responseText);
            console.log('error', xhr);
        },

        onClickSave: function() {
            var key = this.$('textarea[name=key]').val();
            this.model.save({key: key});
        },

        onRender: function() {
            this.$el.modal();
        }
    });
});