// @flow
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { Link } from 'react-router';

import Echo from 'components/Echo';

import hello from './hello.jpg';
import s from './styles.scss';

export default class App extends React.Component {
  static defaultProps: {
    className: string,
  };

  render() {
    return (
      <div className={this.props.className}>
        <img className={s.robot} src={hello} alt="Cute robot?" />
        <Echo text="Hello, world! Find me in App.jsx!" />

        <div style={{ border: 'solid 1px grey' }}>
          {this.props.children || <ul>
            <li><Link to="/nested">Link to /nested.</Link></li>
            <li><Link to="/login">Link to /login.</Link></li>
          </ul> }
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element,
  className: React.PropTypes.string,
};

App.defaultProps = {
  children: null,
  className: s.app,
};
