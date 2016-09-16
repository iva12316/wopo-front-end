import Ember from 'ember';
import fetch from 'ember-network/fetch';
import Base from 'ember-simple-auth/authenticators/base';

const {
  RSVP,
  isEmpty,
  inject: { service }
} = Ember;

export default Base.extend({
  cookies: service(),
  store: service(),
  intl: service(),
  session: service(),

  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!this._validate(data)) {
        console.log('here');
        reject();
        return;
      }

      const headers = {
        'Authorization': `Bearer ${data.token}`
      };

      this
        .makeRequest('users/session/check', {}, headers)
        .then(() => {
          resolve(data);
        })
        .catch(error => {
          if (!error.response) {
            failure(error);
            return;
          }

          error.response.json().then(function(reason) {
            failure(reason);
          });
        });

      function failure (reason) {
        if (reason.errors && reason.errors[0].detail) {
          reject(reason.errors[0].detail);
          return;
        }

        reject(reason);
      }
    });
  },

  authenticate(email, password) {
    return new RSVP.Promise((resolve, reject) => {
      const data = { email, password };

      this.makeRequest('users/session', data)
        .then(response => {
          if (!this._validate(response)) {
            reject('token is missing in server response');
            return;
          }

          if (!this._validate(response, 'portfolioDone')) {
            reject('portfolioDone is missing in server response');
            return;
          }

          resolve(response);
        })
        .catch(error => {
          if (!error.response) {
            reject(error);
            return;
          }

          error.response.json().then(function(reason) {
            reject(reason);
          });
        });
    });
  },

  _validate(data, property = 'token') {
    return !isEmpty(data[property]);
  },

  makeRequest(path, data, assignHeaders) {
    const csrfToken = this.get('cookies').read('XSRF-TOKEN');
    const host = this.get('store').adapterFor('application').get('host');
    let headers = {
      'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (this.get('intl').get('locale')) {
      headers['X-Locale'] = this.get('intl').get('locale')[0];
    }

    if (assignHeaders) {
      headers = Object.assign(assignHeaders, headers);
    }

    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    };

    return fetch(`${host}/${path}`, init)
      .then(checkStatus)
      .then(parseJSON);

    function checkStatus (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }

    function parseJSON (response) {
      return response.json();
    }
  }
});
