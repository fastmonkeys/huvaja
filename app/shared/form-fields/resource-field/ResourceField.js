import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';

import ResourceSelectorModal from 'shared/modals/resource-selector';

ResourceField.propTypes = {
  id: PropTypes.string.isRequired,
  controlProps: PropTypes.object,
  hideSelector: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  showSelector: PropTypes.func.isRequired,
  validationState: PropTypes.string,
};
export default function ResourceField({
  id,
  controlProps,
  hideSelector,
  label,
  showSelector,
  validationState,
}) {
  const onSelect = (resourceId) => {
    controlProps.onChange(resourceId);
    hideSelector();
  };
  const resourceName = (
    controlProps.resource ?
    controlProps.resource.name.fi :
    ''
  );
  return (
    <div className="resource-field">
      <FormGroup
        controlId={id}
        onClick={showSelector}
        validationState={validationState}
      >
        <ControlLabel>
          {label}
        </ControlLabel>
        <InputGroup>
          <FormControl readOnly type="text" value={resourceName} />
          <InputGroup.Button>
            <Button>Vaihda tila</Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
      <ResourceSelectorModal
        onSelect={onSelect}
        selectedResource={controlProps.resource}
        selectedTimeRange={controlProps.timeRange}
      />
    </div>
  );
}