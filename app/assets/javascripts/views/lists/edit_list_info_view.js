ListsEditListInfoView = Backbone.View.extend({
    events: {
    },

    initialize: function () {
        this.lists_edit_title_view = new ListsEditTitleView({
            el: '#list_title_container',
            model: this.model
        });

        this.lists_edit_description_view = new ListsEditDescriptionView({
            el: '#list_description_container',
            model: this.model
        });

        this.listenTo(this.model.listings, 'create_listing', this.createListing);
        this.listenTo(this.model, 'update_list_info', this.updateListInfo);
        this.listenTo(this.model, 'submit_list', this.handleSubmit);
    },

    createListing: function (selected_estab) {
        this.updateListInfo();
        this.saveList(selected_estab);
    },

    updateListInfo: function (establishment) {
        // Set the List model attrs on client
        var title = this.model.get('type') === 'WishList' ? this.model.get('title') : $('#title_input').val();
        var description = $('#description_input').val();

        if (title.length > 255) {
            alert('Your title is too long. Titles are limited to 255 characters.');
        } else if (title.length <= 5) {
            alert('Your title is too short. Title your list something descriptive to help other YumHackers find it!');            
        } else {
            this.model.set({ 
                'title': title,
                'description': description
            });             
        }
    },

    saveList: function (establishment) {
        this.model.save({}, { success: $.proxy(function () {
            if (establishment) {
                this.saveListing(establishment);
            }
        }, this) });       
    },

    saveListing: function (establishment) {
        var listing = new Listing({
            establishment_id: establishment.get('id'),
            list_id: this.model.get('id')
        });

        listing.save({}, { success: $.proxy(function (model) { this.model.listings.add(model) }, this) });
        
        ModalView.hide();
    }, 

    handleSubmit: function () {
        this.updateListInfo();
        // Submit any unsaved comments
        $('form').trigger('submit');

        this.model.save({}, 
            { success: function (model) {
                App.navigate('/' + model.get('path'), { trigger: true }) } 
            });
    },

    navigate: function (e) {
        e.preventDefault();
        App.navigate(e.currentTarget.pathname, { trigger: true });
    }
});