import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  'data.about': [
    validator('presence', true)
  ]
});

export default Validations;