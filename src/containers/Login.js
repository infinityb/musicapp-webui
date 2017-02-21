// @flow

import { connect } from 'react-redux';
import Login from 'components/Login';

// const mapStateToProps = (state: State) => ({ value: state.counters.value });

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   onIncrementClick: () => dispatch(increment()),
//   onDecrementClick: () => dispatch(decrement()),
// });

const ContainedLogin = connect(
//   mapStateToProps,
//   mapDispatchToProps,
)(Login);

export default ContainedLogin;
