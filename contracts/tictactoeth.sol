pragma solidity ^0.4.0;
import "./Ownable.sol";
import "./gameLib.sol";

contract tictactoeth is Ownable{

  uint public fees;
  function collect() external onlyOwner(){
    _owner.transfer( fees );
    fees = 0;
  }

  uint public numGames;
  gameLib.game[] public games;
  using gameLib for gameLib.game;
  event newMoveEvent(
      uint indexed _id
  );

  function getMoves(uint id) external view returns (uint8[9] moves){
    for(uint8 i=0; i < 9; i++){
      moves[i] = uint8( games[id].moves[i] );
    }
  }

  function newGame( uint bet, uint turn, uint8 move ) payable external returns( uint ){

    require( 100 < msg.value );
    require( 100 < bet );
    require( 300 < turn && turn < 864000 );
    require( move < 9 );

    gameLib.mark[9] memory moves;
    moves[move]=gameLib.mark.pX;

    games.push( gameLib.game( msg.sender, 0, msg.value, bet, turn, 0, 1, moves ) );
    numGames++;

    emit newMoveEvent( numGames - 1 );
    return( numGames - 1 );
  }

  modifier validGame(uint id){
    require( 0 != games[id].turn );
    _;
  }

  function joinGame( uint id, uint8 move ) payable external validGame(id) returns (bool){

    require( games[id].bet <= msg.value );

    require( games[id].join( msg.sender, move ) );
    emit newMoveEvent( id );

    if( games[id].bet < msg.value ) msg.sender.transfer( msg.value - games[id].bet );
    return true;
  }

  function newMove( uint id, uint8 move ) external validGame(id) returns(bool){

    if( games[id].isExpired() ) return endGame(id,3);

    require( games[id].newMove( msg.sender, move ) );

    if( games[id].isWin() ) return endGame( id,1 );
    else if( 9 == games[id].numMoves ) return endGame( id, 2 );

    emit newMoveEvent(id);
    return true;
  }

  function cancelGame(uint id) external validGame(id) returns (bool){
    require( 1 == games[id].numMoves );
    require( msg.sender == games[id].playerX );
    return endGame( id, 0 );
  }

  function endGame(uint id, uint8 code) private returns (bool){

    gameLib.game memory gm = games[id];
    uint vig;
    uint payX;
    uint payO;

    if(code==0){ // Cancel
      payX = gm.wager; 
    }
    else if(code==1){ // Win
      if( gm.numMoves % 2 == 1 ) payX = gm.wager + gm.bet;
      else payO = gm.wager + gm.bet;
    }
    else if(code==2){ //  Stalemate
      vig = (gm.wager / 100) + (gm.bet / 100);
      payX = gm.wager - (gm.wager / 100);
      payO = gm.bet - (gm.bet / 100); 
    }
    else if(code==3){ // Timeout
      vig = (gm.wager + gm.bet) / 100;
      if( gm.numMoves % 2 == 1 ) payX = gm.wager + gm.bet - vig;
      else payO = gm.wager + gm.bet - vig;
    }

    games[id].turn = 0;
    games[id].deadline = code; 
    fees += vig;
    gm.playerX.transfer(payX);
    gm.playerO.transfer(payO);
    emit newMoveEvent(id);
    return true;
  }
}