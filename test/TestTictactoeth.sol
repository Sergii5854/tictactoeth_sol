pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/tictactoeth.sol";

contract TestTictactoeth {

  function testNumGames() {

    tictactoeth meta = new tictactoeth();

    Assert.equal( uint(0), meta.numGames() , "New contract has too many games.");
  }

}
