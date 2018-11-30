pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/tictactoeth.sol";

contract tictactoethTest {

  function testNumGames() public {

    tictactoeth meta = new tictactoeth();

    Assert.equal( uint(0), meta.numGames() , "New contract has too many games.");
  }
}
