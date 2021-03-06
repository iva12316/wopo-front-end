import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement () {
    const notifications = this.$('.notifications-desktop');
    const notificationsDropdown = this.$('.notifications-desktop .dropdown-menu');

    const preventClosing = function (e) {
      if (notifications.hasClass('open')) {
        e.stopPropagation();
      }
    };

    notificationsDropdown.on('click', preventClosing);

    this.set('notificationsDropdown', notificationsDropdown);
    this.set('preventClosing', preventClosing);
  },
  willDestroyElement () {
    this.get('notificationsDropdown').off('click', this.get('preventClosing'));
  }
});
