import React, { PropTypes } from 'react';

import GroupInfo from './GroupInfo';

Sidebar.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired })
  ).isRequired,
};
export default function Sidebar(props) {
  return (
    <div className="sidebar">
      {props.groups.map(group => <GroupInfo key={group.name} {...group} />)}
    </div>
  );
}
