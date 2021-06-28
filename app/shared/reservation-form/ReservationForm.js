import moment from 'moment';
import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';

import AlertText from 'shared/alert-text';
import CompactReservationList from 'shared/compact-reservation-list';
import RecurringReservationControls from 'shared/recurring-reservation-controls';
import ReduxFormField from 'shared/form-fields/ReduxFormField';
import timeUtils from 'utils/timeUtils';

const requiredFields = [
  'eventSubject',
  'hostName',
  'numberOfParticipants',
  'reserverName',
  'resource',
  'time',
];

function constructMoment(value) {
  const dateString = `${value.date}T${value.time}:00.000`;
  return moment(dateString, moment.ISO_8601, true);
}

function didResourceChange(old, current) {
  const currentId = current && current.id;
  const oldId = old && old.id;
  return Boolean(currentId && currentId !== oldId);
}

export function validate(values) {
  const errors = {};
  requiredFields.forEach((value) => {
    if (!values[value]) {
      errors[value] = 'Pakollinen tieto';
    }
  });

  if (!errors.time) {
    const begin = constructMoment(values.time.begin);
    const end = constructMoment(values.time.end);
    if (begin.isValid() && end.isValid()) {
      if (!begin.isBefore(end)) {
        errors.time = 'Alkamisajan on oltava ennen loppumisaikaa';
      } else {
        const pattern = /^\d\d:\d[05]$/;
        const areTimesValid = (
          pattern.exec(values.time.begin.time) &&
          pattern.exec(values.time.end.time)
        );
        if (!areTimesValid) {
          errors.time = 'Minuutin on oltava jaollinen viidellä, esim. 00, 05, 10, 15 jne.';
        }
      }
    } else {
      errors.time = 'Epäkelpo päivä tai aika';
    }
  }

  return errors;
}

function renderField(name, type, label, controlProps = {}) {
  const required = requiredFields.indexOf(name) !== -1;
  return (
    <Field
      component={ReduxFormField}
      controlProps={controlProps}
      label={`${label}${required ? '*' : ''}`}
      name={name}
      type={type}
    />
  );
}

export class UnconnectedReservationForm extends React.Component {
  componentDidMount() {
    if (this.props.resource) {
      this.props.fetchResource(
        this.props.resource.id,
        { date: this.props.timelineDate }
      );
    }
    if (this.props.cateringProvider) {
      const id = this.props.cateringProvider.id;
      this.props.fetchCateringProducts(id);
      this.props.fetchCateringProductCategories(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const hasTimelineChanged = (
      this.props.timelineDate !== nextProps.timelineDate ||
      didResourceChange(this.props.resource, nextProps.resource)
    );
    if (hasTimelineChanged && nextProps.resource) {
      this.props.fetchResource(
        nextProps.resource.id, { date: nextProps.timelineDate }
      );
    }

    const prevId = this.props.cateringProvider && this.props.cateringProvider.id;
    const nextId = nextProps.cateringProvider && nextProps.cateringProvider.id;
    if (nextId && prevId !== nextId) {
      this.props.fetchCateringProducts(nextId);
      this.props.fetchCateringProductCategories(nextId);
    }

    this.changeBaseTime(nextProps);
  }

  getWarning() {
    const tooManyParticipants = (
      this.props.resource &&
      this.props.resource.peopleCapacity &&
      this.props.numberOfParticipants &&
      this.props.numberOfParticipants > this.props.resource.peopleCapacity
    );
    if (tooManyParticipants) {
      return (
        'Huomaa että osallistujia on enemmän kuin tilassa on istumapaikkoja.'
      );
    }
    return null;
  }

  changeBaseTime(nextProps) {
    if (!this.props.changeBaseTime) return;
    const oldRange = timeUtils.getDateTimeRangeFieldMoments(this.props.timeRange);
    const newRange = timeUtils.getDateTimeRangeFieldMoments(nextProps.timeRange);
    const shouldChange = (
      newRange &&
      newRange.begin &&
      newRange.end &&
      !(
        newRange.begin.isSame(oldRange.begin) &&
        newRange.end.isSame(oldRange.end)
      )
    );
    if (shouldChange) {
      this.props.changeBaseTime(newRange);
    }
  }

  render() {
    const warning = this.getWarning();
    const cateringDisabledReason = this.props.isRecurring ?
      (
        'Huom. Tarjoilutilauksia ei voi tehdä toistuviin varauksiin. Jos ' +
        'haluat tilata tarjoiluja, poista varauksen toistuvuus tai lisää ' +
        'tarjoilutilaukset jälkeenpäin yksittäisiin varauksiin.'
      ) :
      null;
    const isRecurringDisabled = Boolean(
      !this.props.isRecurring &&
      (!this.props.baseReservation || this.props.isOrderingCatering)
    );
    const recurringDisabledReason = this.props.isOrderingCatering ?
      (
        'Huom. Toistuvaa varausta ei voi tehdä, kun varaukseen sisältyy ' +
        'tarjoilutilaus. Jos haluat tehdä toistuvan varauksen, poista ' +
        'tarjoilutilaus ja lisää se jälkeenpäin yksittäisiin varauksiin.'
      ) :
      null;

    return (
      <div>
        <form className="reservation-form" onSubmit={this.props.handleSubmit}>
          <div>
            <Row>
              <Col md={6}>
                <h3>Tila ja aika</h3>
                {renderField(
                  'resource',
                  'resource',
                  'Tila',
                  {
                    resource: this.props.resource,
                    timeRange: this.props.timeRange,
                    allowedCateringProvider: (
                      this.props.isOrderingCatering ?
                      this.props.cateringProvider :
                      null
                    ),
                  }
                )}
                {renderField(
                  'time',
                  'date-time-range',
                  'Varauksen aika',
                  { required: true },
                )}
                {this.props.allowRecurring &&
                  <div>
                    {renderField(
                      'isRecurring',
                      'checkbox',
                      'Tee toistuva varaus',
                      {
                        className: 'is-recurring-checkbox',
                        disabled: isRecurringDisabled,
                      },
                    )}
                    {recurringDisabledReason &&
                      <p className="recurring-disabled-reason">
                        {recurringDisabledReason}
                      </p>
                    }
                    {this.props.isRecurring &&
                      <div className="recurring-reservations">
                        <RecurringReservationControls />
                        {this.props.baseReservation &&
                          <CompactReservationList
                            onRemoveClick={this.props.removeRecurringReservation}
                            removableReservations={this.props.recurringReservations}
                            reservations={[this.props.baseReservation]}
                          />
                        }
                      </div>
                    }
                  </div>
                }
              </Col>
              {this.props.resource && !this.props.isRecurring &&
                <Col md={12}>
                  <div className="timeline-container reservation-form-timeline">
                    <h5>Varaustilanne</h5>
                    <p className="help-text">Voit valita ajan myös maalaamalla.</p>
                    {renderField(
                      'time',
                      'reservation-time',
                      'Aika',
                      {
                        date: this.props.timelineDate,
                        excludeReservation: this.props.reservation && this.props.reservation.id,
                        hideDateSelector: true,
                        resource: this.props.resource,
                        onDateChange: () => null,
                      }
                    )}
                  </div>
                </Col>
              }
            </Row>
            <Row>
              <Col md={6}>
                <h3>Perustiedot</h3>
                {renderField(
                  'eventSubject',
                  'text',
                  'Varauksen otsikko',
                )}
                {renderField(
                  'reserverName',
                  'text',
                  'Varaaja',
                )}
                {renderField(
                  'hostName',
                  'text',
                  'Varauksen isäntä',
                )}
              </Col>
              <Col md={6}>
                <h3>Osallistujat</h3>
                {renderField(
                  'numberOfParticipants',
                  'number',
                  'Osallistujien määrä',
                  { min: 1 },
                )}
                {renderField(
                  'participants',
                  'textarea',
                  'Lista osallistujista',
                  { rows: 6 },
                )}
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                {this.props.cateringProvider && renderField(
                  'cateringOrder',
                  'cateringOrder',
                  'Tarjoilutilaus',
                  { disabledReason: cateringDisabledReason },
                )}
              </Col>
              <Col md={6}>
                <h3>Muuta</h3>
                {renderField(
                  'eventDescription',
                  'textarea',
                  'Lisätietoja',
                  { rows: 6 },
                )}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {this.props.error &&
                  <AlertText
                    className="reservation-form-error"
                    text={this.props.error}
                    type="error"
                  />
                }
                {warning &&
                  <AlertText
                    className="reservation-form-warning"
                    text={warning}
                    type="warning"
                  />
                }
                <div className="form-controls">
                  <Button bsStyle="default" onClick={browserHistory.goBack}>
                    Peruuta
                  </Button>
                  <Button bsStyle="primary" type="submit">
                    {this.props.submitting ? 'Tallennetaan...' : 'Tallenna varaus'}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

UnconnectedReservationForm.propTypes = {
  allowRecurring: PropTypes.bool,
  baseReservation: PropTypes.object,
  cateringProvider: PropTypes.object,
  changeBaseTime: PropTypes.func,
  error: PropTypes.string,
  fetchCateringProducts: PropTypes.func.isRequired,
  fetchCateringProductCategories: PropTypes.func.isRequired,
  fetchResource: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isOrderingCatering: PropTypes.bool.isRequired,
  isRecurring: PropTypes.bool,
  numberOfParticipants: PropTypes.number,
  recurringReservations: PropTypes.array,
  removeRecurringReservation: PropTypes.func,
  reservation: PropTypes.object,
  resource: PropTypes.object,
  submitting: PropTypes.bool.isRequired,
  timeRange: PropTypes.object,
  timelineDate: PropTypes.string.isRequired,
};

export default reduxForm({
  form: 'resourceReservation',
  validate,
})(UnconnectedReservationForm);
