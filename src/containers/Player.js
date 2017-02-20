// @flow

import { connect } from 'react-redux';
import { increment, decrement } from 'actions';
import Player from 'components/Player';

// const mapStateToProps = (state: State) => ({ value: state.counters.value });

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   onIncrementClick: () => dispatch(increment()),
//   onDecrementClick: () => dispatch(decrement()),
// });

const ContainedPlayer = connect(
//   mapStateToProps,
//   mapDispatchToProps,
)(Player);

export default ContainedPlayer;
