// @flow

import React from 'react';
import { LoginRequest } from './../../siteapi';
import { browserHistory } from 'react-router';

export default class Login extends React.Component {
  componentDidMount() {
    console.log("LoginRequest:", LoginRequest);
    window.__google_loaded.then(function(gapi) {
      return new Promise(function(resolve, reject) {
        gapi.signin2.render('g-signin2', {
          'width': 200,
          'height': 50,
          'longtitle': true,
          'theme': 'dark',
          'onsuccess': resolve,
          'onerror': reject,
        });
      }).catch(function(error) {
        console.log("error getting gogole user", error);
      }).then(function(googleUser) {
        var id_token = googleUser.getAuthResponse().id_token;
        var logreq = new LoginRequest("google", id_token);
        console.log("got google user:", logreq);
        return logreq.execute();
      }).catch(function(error) {
        console.log("error executing login request", error);
      }).then(function(logresp) {
        console.log("got musicapp user:", logresp);
        window.localStorage['auth_token'] = logresp.access_token;
        browserHistory.push('/player');
      })
    })
  }
  onSignIn(googleUser) {
    console.log(googleUser);
		let profile = googleUser.getBasicProfile();
		sessionStorage.setItem('authToken', profile.getId());
		sessionStorage.setItem('name', profile.getName());
		sessionStorage.setItem('imageUrl', profile.getImageUrl());
		sessionStorage.setItem('email', profile.getEmail());

		let account = this.props.cursor.refine('account');
		account.refine('authToken').set(sessionStorage.getItem('authToken'));
		account.refine('name').set(sessionStorage.getItem('name'));
		account.refine('imageUrl').set(sessionStorage.getItem('imageUrl'));
		account.refine('email').set(sessionStorage.getItem('email'));
  }
  render() {
    return (
      <div id="g-signin2" data-theme="dark"></div>
    );
  }
}
