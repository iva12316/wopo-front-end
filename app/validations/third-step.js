import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  'data.jobOffers': [
    validator('presence', true),
    validator('inclusion', {
      in: [true, false]
    })
  ],
  'data.selectedHosting': [
    validator('inclusion', {
      in: ['wopo', null], // TODO: githubPages, ftp
      messageKey: 'errors.underConstruction'
    })
  ]
});

export default Validations;