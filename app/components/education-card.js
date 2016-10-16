import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  date: computed('data.startDate', 'data.endDate', function () {
    const startDate = this.get('data.startDate');
    const endDate = this.get('data.endDate');

    return (endDate) ? `${startDate} - ${endDate}` : startDate;
  })
});
