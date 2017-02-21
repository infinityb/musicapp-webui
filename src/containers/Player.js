// @flow

import { connect } from 'react-redux';
import * as actions from 'actions/playlist';
// import * as state from 
import { Player } from 'components/Player';


const mapStateToProps = (state: State) => ({ value: state.counters.value });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onIncrementClick: () => dispatch(actions.increment()),
  onDecrementClick: () => dispatch(decrement()),
});

const ContainedPlayer = connect(
//   mapStateToProps,
//   mapDispatchToProps,
)(Player);

export default ContainedPlayer;
