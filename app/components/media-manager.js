import Ember from 'ember';

const {
  computed,
  inject: { service }
} = Ember;

export default Ember.Component.extend({
  cookies: service(),
  store: service(),
  intl: service(),
  session: service(),
  network: service(),

  selectedMedia: null,
  disableSelect: computed('selectedMedia', function () {
    return this.get('selectedMedia') === null;
  }),

  didInsertElement () {
    const host = this.get('store').adapterFor('application').get('host');
    const headers = this._headers();
    const container = $('.media-container');

    Dropzone.autoDiscover = false;

    const selectMedia = (e) => {
      const media = $(e.currentTarget);

      if (media.hasClass('selected')) {
        return;
      }
      
      container.find('.media').removeClass('selected');
      $(media).addClass('selected');

      const url = media.find('.card-img').attr('src');
      this.set('selectedMedia', url);
    };

    container.dropzone({
      url: `${host}/media-manager`,
      maxFilesize: 2,
      parallelUploads: 1,
      uploadMultiple: false,
      createImageThumbnails: false,
      paramName: 'media',
      headers,
      clickable: '.btn-upload',
      acceptedFiles: 'image/jpg, image/jpeg, image/png',
      dictInvalidFileType: this.get('intl').t('errors.fileType'),
      dictFileTooBig: this.get('intl').t('errors.fileTooBig', {
        maxFilesize: '2MiB'
      }),

      previewTemplate: `
        <div class="media">
          <div class="card card-media">
            <div class="card-img-container">
              <img class="card-img" src="" alt="">
            </div>
            <div class="card-img-overlay">
              <div class="error-message"></div>
              <progress class="progress" value="0" max="100"></progress>
              <button type="button" class="delete" aria-label="Delete">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        </div>
      `,

      error: (file, message) => {
        const media = $(file.previewElement);

        if (!media) {
          return;
        }

        if (typeof message !== 'string' && message.errors[0].detail) {
          message = message.errors[0].detail;
        }
        
        media.addClass('error');
        media.removeClass('dz-processing');
        media.find('.error-message').html(message);
      },

      success: function (file, response) {
        const media = $(file.previewElement);

        media.find('.card-img').attr('src', response.url);
        
        media.removeClass('dz-processing');
        media.addClass('dz-success');

        media.on('click', selectMedia);

        media.find('.delete').on('click', (e) => {
          this.removeFile(file);
          e.preventDefault();
        });
      },

      removedfile: (file) => {
        const media = $(file.previewElement);
        const url = media.find('.card-img').attr('src');
        
        this
          .get('network')
          .delete('media-manager', { url }, true)
          .then(() => {
            media.remove();
          })
          .catch(error => {
            if (!error.response) {
              console.error(error);
              return;
            }

            error.response.json().then(function(reason) {
              if (!reason.errors && !reason.errors[0].detail) {
                console.error(error);
                return;
              }

              console.error(reason.errors[0].detail);
            });
          });
      },

      uploadprogress: (file, progress) => {
        const media = $(file.previewElement);
        media.find('.progress').val(progress);
      }
    });

    container.find('.media').on('click', selectMedia);

    $('.footer').on({
      dragover () {
        return false;
      },

      drop () {
        return false;
      }
    });

    // TODO: show files already stored on server
  },

  _headers () {
    const csrf = decodeURIComponent(this.get('cookies').read('XSRF-TOKEN'));
    const token = this.get('session.data.authenticated.token');

    let headers = {
      'X-XSRF-TOKEN': csrf,
      'Authorization': `Bearer ${token}`
    };

    if (this.get('intl').get('locale')) {
      headers['X-Locale'] = this.get('intl').get('locale')[0];
    }

    return headers;
  },

  actions: {
    select () {
      console.log(this.get('selectedMedia'));
    }
  }
});