var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Marionette.ItemView.extend({
    id: 'server-boot-options',
    template: require('../tpl/server-boot-options.hbs'),
    events: {
        'click .save': 'onSave',
        'click .cancel': 'onCancel',
        'keydown textarea': 'onInputKeydown',
        'keyup textarea': 'onInputKeyup'
    },

    serializeData: function() {
        var data = _.clone(this.model.toJSON());
        data.kernel_args = JSON.stringify(data.kernel_args, null, 2);
        return data;
    },

    onInputKeydown: function() {
        this.$('.error').text();
        this.$('.error').hide();
        this.$('.save').prop('disabled', true);
    },

    onInputKeyup: _.debounce(function() {
        var text = this.$('textarea').val();
        try {
            var json = JSON.parse(text);
            this.$('.error').text();
            this.$('.error').hide();
            this.$('.save').prop('disabled', false);
        } catch (e) {
            this.$('.error').text(e.message)
            this.$('.error').show();
            this.$('.save').prop('disabled', true);
        }
    }, 200),

    onRender: function() {
        this.$('textarea').autosize();
    },

    onCancel: function() {
        this.trigger('cancel');
    },

    onSave: function(e) {
        e.preventDefault();
        var self = this;

        var data = {
            kernel_args: JSON.parse(this.$('textarea').val()),
            platform: this.$('.platform').val()
        };

        this.model.save(data).done(function() {
            self.trigger('saved');
        });
    }

});