var gameLib = artifacts.require("./gameLib.sol");
var tictactoeth = artifacts.require("./tictactoeth.sol");

module.exports = function(deployer) {
  deployer.deploy( gameLib )
  deployer.link(gameLib, tictactoeth);
  return deployer.deploy( tictactoeth );
};